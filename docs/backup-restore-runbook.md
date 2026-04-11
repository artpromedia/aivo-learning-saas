# AIVO Learning Platform — Backup & Restore Runbook

**Version:** 1.0
**Last Updated:** 2025-01-01
**Owner:** Platform Engineering

---

## 1. Backup Architecture Overview

### Components Backed Up

| Component | Method | Schedule | Retention | Storage |
|-----------|--------|----------|-----------|---------|
| PostgreSQL 16 (aivo_prod) | `pg_dump` → gzip | Hourly | 30 days | S3 (STANDARD_IA) |
| Redis 7 (RDB snapshot) | `BGSAVE` → gzip | Hourly | 30 days | S3 (STANDARD_IA) |
| NATS JetStream | PVC-backed (200Gi) | Continuous | N/A (replicated) | Local NVMe |
| Application configs | Helm values in Git | Every commit | Indefinite | Git repository |
| User-uploaded assets | Cloudflare R2 | N/A (primary store) | Indefinite | Cloudflare R2 |

### Backup Agent

The backup agent runs as a containerized CronJob on the K3s cluster.

- **Image:** Built from `infra/backup-agent/Dockerfile` (Alpine 3.20 + pg16-client + redis-cli + aws-cli)
- **Script:** `infra/backup-agent/backup.sh`
- **User:** Non-root (uid 1001, `backup` user)
- **Logs:** `/app/logs/last-run.log` inside the container

### Backup Naming Convention

```
pg-{YYYYMMDD}T{HHMMSS}Z.sql.gz      # PostgreSQL backups
redis-{YYYYMMDD}T{HHMMSS}Z.rdb.gz   # Redis backups
```

### S3 Storage Layout

```
s3://${S3_BACKUP_BUCKET}/
└── backups/
    ├── pg-20250101T000000Z.sql.gz
    ├── pg-20250101T010000Z.sql.gz
    ├── ...
    ├── redis-20250101T000000Z.rdb.gz
    └── redis-20250101T010000Z.rdb.gz
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection string (skip Redis backup if unset) |
| `S3_BACKUP_BUCKET` | No | S3 bucket name (skip upload if unset) |
| `BACKUP_RETENTION_DAYS` | No | Days to retain local backups (default: 30) |
| `AWS_ACCESS_KEY_ID` | Yes (for S3) | AWS/S3-compatible credentials |
| `AWS_SECRET_ACCESS_KEY` | Yes (for S3) | AWS/S3-compatible credentials |
| `AWS_DEFAULT_REGION` | No | S3 region |

---

## 2. Step-by-Step Restore Procedures

### 2.1 PostgreSQL Full Restore

**When to use:** Database corruption, accidental data deletion, or complete database loss.

**Prerequisites:**
- Access to Server 1 (10.0.0.1) via SSH
- AWS CLI configured with backup bucket credentials
- All application services stopped to prevent writes during restore

**Procedure:**

1. **Identify the target backup:**
   ```bash
   aws s3 ls s3://${S3_BACKUP_BUCKET}/backups/ --recursive \
     | grep "^.*pg-" | sort | tail -10
   ```

2. **Stop all services to prevent writes:**
   ```bash
   kubectl scale deploy --all --replicas=0 -n aivo
   ```

3. **Download the backup:**
   ```bash
   BACKUP_FILE="pg-20250101T120000Z.sql.gz"
   aws s3 cp "s3://${S3_BACKUP_BUCKET}/backups/${BACKUP_FILE}" /tmp/restore.sql.gz
   ```

4. **Verify the backup file integrity:**
   ```bash
   gunzip -t /tmp/restore.sql.gz
   echo "Exit code: $? (0 = OK)"
   ```

5. **Create a safety backup of current state:**
   ```bash
   ssh 10.0.0.1 "pg_dump -U aivo aivo_prod | gzip > /tmp/pre-restore-$(date +%s).sql.gz"
   ```

6. **Restore the backup:**
   ```bash
   ssh 10.0.0.1 "gunzip -c /tmp/restore.sql.gz | psql -U aivo -d aivo_prod"
   ```

7. **Verify the restore (see Section 4).**

8. **Restart services:**
   ```bash
   helm upgrade aivo infra/helm -f infra/helm/values/hetzner-production.yaml
   ```

9. **Monitor services for 30 minutes** before declaring recovery complete.

### 2.2 PostgreSQL Point-in-Time / Table-Level Restore

**When to use:** Only specific tables are corrupted; other data should be preserved.

1. **Download and extract the backup to a temporary database:**
   ```bash
   ssh 10.0.0.1 "createdb -U aivo aivo_restore_temp"
   ssh 10.0.0.1 "gunzip -c /tmp/restore.sql.gz | psql -U aivo -d aivo_restore_temp"
   ```

2. **Export the specific tables from the temporary database:**
   ```bash
   ssh 10.0.0.1 "pg_dump -U aivo -t target_table --data-only aivo_restore_temp > /tmp/table_data.sql"
   ```

3. **Clear and restore the target table in production:**
   ```bash
   ssh 10.0.0.1 "psql -U aivo -d aivo_prod -c 'TRUNCATE target_table CASCADE;'"
   ssh 10.0.0.1 "psql -U aivo -d aivo_prod < /tmp/table_data.sql"
   ```

4. **Clean up the temporary database:**
   ```bash
   ssh 10.0.0.1 "dropdb -U aivo aivo_restore_temp"
   ```

### 2.3 Redis Restore

**When to use:** Persistent Redis data loss. Note that Redis is primarily used for caching and sessions — a restart with empty data is often acceptable.

1. **Stop Redis:**
   ```bash
   ssh 10.0.0.1 "systemctl stop redis"
   ```

2. **Download the backup:**
   ```bash
   BACKUP_FILE="redis-20250101T120000Z.rdb.gz"
   aws s3 cp "s3://${S3_BACKUP_BUCKET}/backups/${BACKUP_FILE}" /tmp/redis-restore.rdb.gz
   ```

3. **Decompress and place the RDB file:**
   ```bash
   gunzip /tmp/redis-restore.rdb.gz
   ssh 10.0.0.1 "cp /tmp/redis-restore.rdb /var/lib/redis/dump.rdb"
   ssh 10.0.0.1 "chown redis:redis /var/lib/redis/dump.rdb"
   ```

4. **Start Redis:**
   ```bash
   ssh 10.0.0.1 "systemctl start redis"
   ```

5. **Verify:**
   ```bash
   ssh 10.0.0.1 "redis-cli DBSIZE"
   ssh 10.0.0.1 "redis-cli INFO keyspace"
   ```

### 2.4 Full Infrastructure Rebuild

**When to use:** Complete loss of all servers (worst case).

1. Provision new servers via Hetzner Robot API or console
2. Install K3s on app servers:
   ```bash
   # On Server 2 (control plane)
   curl -sfL https://get.k3s.io | sh -

   # On Server 3 (agent)
   curl -sfL https://get.k3s.io | K3S_URL=https://10.0.0.2:6443 K3S_TOKEN=<token> sh -
   ```
3. Install PostgreSQL 16 and Redis 7 on Server 1
4. Restore database from S3 backup (see 2.1)
5. Deploy all services via Helm:
   ```bash
   helm install aivo infra/helm -f infra/helm/values/hetzner-production.yaml
   ```
6. Update Cloudflare DNS if IP addresses changed
7. Verify SSL certificates via cert-manager
8. Run full recovery verification checklist

---

## 3. Backup Verification Testing

### Automated Weekly Test

Run `scripts/test-backup-restore.sh` weekly to verify backup integrity. This script:
- Downloads the latest PostgreSQL backup from S3
- Restores it to an ephemeral test database
- Validates row counts against the production database
- Reports success or failure
- Cleans up the test database

### Manual Quarterly Test

Perform a full restore drill quarterly:

1. **Provision a test environment:**
   ```bash
   ssh 10.0.0.1 "createdb -U aivo aivo_dr_test"
   ```

2. **Download and restore the latest backup:**
   ```bash
   aws s3 ls s3://${S3_BACKUP_BUCKET}/backups/ | grep pg- | sort | tail -1
   # Download and restore as in Section 2.1
   ```

3. **Run data validation queries:**
   ```sql
   -- Compare table row counts
   SELECT schemaname, relname, n_live_tup
   FROM pg_stat_user_tables
   ORDER BY n_live_tup DESC;

   -- Check for referential integrity
   SELECT conname, conrelid::regclass, confrelid::regclass
   FROM pg_constraint
   WHERE contype = 'f';
   ```

4. **Verify application connectivity:**
   - Point a test instance of identity-svc at the restored database
   - Confirm login flow works
   - Confirm data queries return expected results

5. **Clean up:**
   ```bash
   ssh 10.0.0.1 "dropdb -U aivo aivo_dr_test"
   ```

6. **Document the results** including:
   - Time to download backup
   - Time to restore
   - Row count validation results
   - Any issues encountered

---

## 4. Data Validation After Restore

### Automated Checks

Run these queries after every restore to validate data integrity:

```sql
-- 1. Table row counts (compare with expected values)
SELECT
  schemaname,
  relname AS table_name,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 2. Check for null primary keys (should return 0 rows)
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND is_nullable = 'YES';

-- 3. Foreign key constraint validation
DO $$
DECLARE
  r RECORD;
  cnt INTEGER;
BEGIN
  FOR r IN
    SELECT conname, conrelid::regclass AS table_name
    FROM pg_constraint
    WHERE contype = 'f'
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM %s WHERE NOT EXISTS (SELECT 1 FROM %s)',
      r.table_name, r.table_name
    ) INTO cnt;
  END LOOP;
END $$;

-- 4. Check database size
SELECT pg_size_pretty(pg_database_size('aivo_prod')) AS db_size;

-- 5. Verify critical tables have data
SELECT 'users' AS table_name, count(*) FROM users
UNION ALL
SELECT 'learners', count(*) FROM learners
UNION ALL
SELECT 'subscriptions', count(*) FROM subscriptions
UNION ALL
SELECT 'learning_sessions', count(*) FROM learning_sessions;
```

### Manual Spot Checks

- [ ] Pick 5 random user IDs and verify their profiles load correctly
- [ ] Verify at least one active subscription exists and is valid
- [ ] Check that the most recent learning session timestamp is within the RPO window
- [ ] Confirm brain profiles load for at least 3 learners
- [ ] Verify tutor catalog returns all expected tutors

---

## 5. Monitoring & Alerting

### Backup Monitoring

| Check | Method | Alert Threshold |
|-------|--------|-----------------|
| Backup completion | CronJob success/failure | Any failure |
| Backup file size | S3 object size check | < 50% of previous backup size |
| Backup age | S3 object timestamp | > 2 hours since last backup |
| S3 bucket storage | CloudWatch/S3 metrics | > 80% of allocated storage |

### Alerting Rules

```yaml
# Prometheus alert rules (infra/monitoring/prometheus/rules/)
- alert: BackupMissing
  expr: time() - backup_last_success_timestamp > 7200
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "No successful backup in the last 2 hours"

- alert: BackupSizeAnomaly
  expr: backup_file_size_bytes < (backup_file_size_bytes offset 1d) * 0.5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Backup size dropped by more than 50%"
```

---

## 6. Troubleshooting

### Backup Failures

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `pg_dump` connection refused | PostgreSQL down or PgBouncer issue | Restart PostgreSQL/PgBouncer on 10.0.0.1 |
| S3 upload fails | Invalid credentials or network issue | Verify AWS credentials in K8s secret |
| Backup file is 0 bytes | Empty database or pg_dump error | Check backup agent logs |
| Redis backup fails | Redis not responding | Non-fatal; Redis backup is optional |
| Disk space full | Local backup retention too long | Reduce `BACKUP_RETENTION_DAYS` or clean manually |

### Restore Failures

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `gunzip: invalid` | Corrupted download | Re-download from S3, verify with `gunzip -t` |
| Foreign key violations | Restore order issue | Use `--disable-triggers` flag with pg_restore |
| Permission denied | Wrong database user | Run as `aivo` superuser |
| "database in use" | Active connections | Terminate connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'aivo_prod' AND pid <> pg_backend_pid();` |

---

## 7. Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-01-01 | 1.0 | Platform Engineering | Initial runbook creation |
