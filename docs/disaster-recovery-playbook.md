# AIVO Learning Platform — Disaster Recovery Playbook

**Version:** 1.0
**Last Updated:** 2025-01-01
**Owner:** Platform Engineering
**Review Cadence:** Quarterly

---

## 1. SLA Definitions

| Metric | Target | Description |
|--------|--------|-------------|
| **RTO (Recovery Time Objective)** | < 4 hours | Maximum acceptable time from incident declaration to full service restoration |
| **RPO (Recovery Point Objective)** | < 1 hour | Maximum acceptable data loss measured in time; backups run hourly |

### SLA Tiers

| Tier | Services | RTO | RPO |
|------|----------|-----|-----|
| **Critical** | identity-svc, billing-svc, learning-svc, ai-svc | < 2 hours | < 30 minutes |
| **High** | tutor-svc, family-svc, engagement-svc, brain-svc, assessment-svc | < 3 hours | < 1 hour |
| **Standard** | comms-svc, admin-svc, integrations-svc, i18n-svc, research-svc, status-page-svc | < 4 hours | < 1 hour |

---

## 2. Infrastructure Overview

| Component | Location | Specification |
|-----------|----------|---------------|
| Server 1 (DB) | HEL1 — 10.0.0.1 | Xeon W-2145 / 128GB ECC / 2x1.92TB DC SSD — PostgreSQL 16, Redis 7 |
| Server 2 (App1) | HEL1 — 10.0.0.2 | i9-9900K / 128GB / 2x1TB NVMe — K3s control plane |
| Server 3 (App2) | HEL1 — 10.0.0.3 | i7-8700 / 128GB / 3x1TB NVMe — K3s agent + MinIO |
| Server 4 (ML) | HEL1 — 10.0.0.4 | Ryzen 9 5950X / 128GB ECC / 2x3.84TB DC SSD — AI/Brain workloads |

**Networking:** Private vSwitch (10.0.0.0/24), Cloudflare for DNS/CDN/SSL termination
**Orchestration:** K3s with Helm charts
**Message Bus:** NATS 2.10 with JetStream (200Gi PVC)
**Object Storage:** Cloudflare R2 (content assets), S3-compatible (backups)

---

## 3. Recovery Procedures

### 3.1 Database Failure (PostgreSQL)

**Symptoms:** Connection timeouts from services, PgBouncer errors, `identity-svc` health checks failing

**Immediate Actions (0–15 minutes):**

1. Confirm the failure:
   ```bash
   ssh 10.0.0.1 "systemctl status postgresql"
   ssh 10.0.0.1 "pg_isready -h localhost -p 5432"
   ```
2. Check PgBouncer status:
   ```bash
   ssh 10.0.0.1 "systemctl status pgbouncer"
   ```
3. Review PostgreSQL logs:
   ```bash
   ssh 10.0.0.1 "tail -100 /var/log/postgresql/postgresql-16-main.log"
   ```

**Recovery — Restart (15–30 minutes):**

1. Attempt a clean restart:
   ```bash
   ssh 10.0.0.1 "systemctl restart postgresql"
   ssh 10.0.0.1 "systemctl restart pgbouncer"
   ```
2. Verify connectivity from the cluster:
   ```bash
   kubectl exec -it deploy/identity-svc -- node -e "
     const pg = require('pg');
     const c = new pg.Client(process.env.DATABASE_URL);
     c.connect().then(() => { console.log('OK'); c.end(); }).catch(console.error);
   "
   ```
3. If restart succeeds, monitor logs for 15 minutes before declaring recovery.

**Recovery — Restore from Backup (30 minutes–4 hours):**

1. If data is corrupted or the restart fails, restore from the latest S3 backup:
   ```bash
   # Download the latest backup
   # Find the latest backup (timestamped format: pg-YYYYMMDD-HHMMSS.sql.gz)
   LATEST_BACKUP=$(aws s3 ls s3://${S3_BACKUP_BUCKET}/backups/pg- --recursive | sort | tail -1 | awk '{print $4}')
   aws s3 cp "s3://${S3_BACKUP_BUCKET}/${LATEST_BACKUP}" /tmp/restore.sql.gz

   # Stop all services to prevent writes
   kubectl scale deploy --all --replicas=0 -n aivo

   # Copy backup to database server and restore
   scp /tmp/restore.sql.gz 10.0.0.1:/tmp/restore.sql.gz
   ssh 10.0.0.1 "gunzip -c /tmp/restore.sql.gz | psql -U aivo -d aivo_prod"

   # Restart services
   helm upgrade aivo infra/helm -f infra/helm/values/hetzner-production.yaml
   ```
2. Run the data validation checklist (see Section 6).

### 3.2 Full Region Outage (Hetzner HEL1)

**Symptoms:** All services unreachable, Cloudflare returning 502/521 errors

**Immediate Actions (0–15 minutes):**

1. Confirm region-wide outage via Hetzner status page (https://status.hetzner.com)
2. Update status page at status.aivolearning.com (if external status page is available)
3. Activate the communication escalation matrix (Section 5)

**Recovery (1–4 hours):**

1. If Hetzner provides an ETA < 2 hours, wait for restoration
2. If ETA > 2 hours or unknown, provision replacement infrastructure:
   ```bash
   # Option A: Hetzner alternate DC (FSN1 or NBG1)
   # Deploy using Terraform with alternate datacenter
   cd infra/terraform/environments/prod
   terraform apply -var="datacenter=fsn1"
   ```
3. Restore the database from the latest S3 backup (see 3.1 Restore from Backup)
4. Update Cloudflare DNS to point to new infrastructure
5. Redeploy all services:
   ```bash
   helm install aivo infra/helm -f infra/helm/values/hetzner-production.yaml
   ```
6. Run the full recovery verification checklist (Section 6)

### 3.3 Individual Service Failure

**Symptoms:** Single service returning 5xx errors, health check failures in K3s

**Immediate Actions (0–5 minutes):**

1. Identify the failing service:
   ```bash
   kubectl get pods -n aivo | grep -v Running
   kubectl describe pod <pod-name> -n aivo
   kubectl logs <pod-name> -n aivo --tail=100
   ```

2. Check resource exhaustion:
   ```bash
   kubectl top pods -n aivo
   kubectl top nodes
   ```

**Recovery — Restart (5–15 minutes):**

1. Restart the failing service:
   ```bash
   kubectl rollout restart deploy/<service-name> -n aivo
   kubectl rollout status deploy/<service-name> -n aivo --timeout=120s
   ```

2. If OOMKilled, temporarily increase limits:
   ```bash
   kubectl set resources deploy/<service-name> -n aivo \
     --limits=memory=1Gi --requests=memory=512Mi
   ```

**Recovery — Rollback (15–30 minutes):**

1. If the failure is caused by a bad deployment:
   ```bash
   kubectl rollout undo deploy/<service-name> -n aivo
   kubectl rollout status deploy/<service-name> -n aivo
   ```

2. If NATS connectivity is the issue:
   ```bash
   kubectl rollout restart statefulset/nats -n aivo
   ```

### 3.4 Data Corruption

**Symptoms:** Inconsistent data, application errors related to constraint violations, user reports of missing or incorrect data

**Immediate Actions (0–15 minutes):**

1. Identify the scope of corruption:
   ```bash
   # Check for constraint violations
   ssh 10.0.0.1 "psql -U aivo -d aivo_prod -c \"
     SELECT schemaname, tablename
     FROM pg_tables
     WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
     ORDER BY tablename;
   \""
   ```

2. If corruption is limited to specific tables, consider a targeted restore:
   ```bash
   # Dump specific tables from backup
   gunzip -c /tmp/restore.sql.gz | grep -A 1000 "COPY affected_table" | head -n 1001
   ```

3. If corruption is widespread, perform a full database restore (see 3.1 Restore from Backup)

**Recovery (30 minutes–4 hours):**

1. Put affected services in maintenance mode:
   ```bash
   kubectl scale deploy/<affected-service> --replicas=0 -n aivo
   ```

2. Create a point-in-time backup of the current (corrupted) state for forensics:
   ```bash
   ssh 10.0.0.1 "pg_dump -U aivo aivo_prod | gzip > /tmp/corrupted-$(date +%s).sql.gz"
   ```

3. Restore from the last known good backup
4. Replay any recoverable transactions from application logs
5. Run data validation (Section 6)
6. Bring services back online one at a time

### 3.5 Redis Failure

**Symptoms:** Session invalidation, cache misses, engagement-svc/comms-svc degradation

**Recovery:**

1. Restart Redis:
   ```bash
   ssh 10.0.0.1 "systemctl restart redis"
   ```
2. Redis data is ephemeral (cache/sessions) — no restore needed in most cases
3. If persistent data in Redis is required, restore from RDB backup:
   ```bash
   LATEST_REDIS=$(aws s3 ls s3://${S3_BACKUP_BUCKET}/backups/redis- --recursive | sort | tail -1 | awk '{print $4}')
   aws s3 cp "s3://${S3_BACKUP_BUCKET}/${LATEST_REDIS}" /tmp/redis-backup.rdb.gz
   gunzip /tmp/redis-backup.rdb.gz
   scp /tmp/redis-backup.rdb 10.0.0.1:/tmp/redis-backup.rdb
   ssh 10.0.0.1 "systemctl stop redis && cp /tmp/redis-backup.rdb /var/lib/redis/dump.rdb && systemctl start redis"
   ```

### 3.6 NATS / JetStream Failure

**Symptoms:** Inter-service event delivery stops, event-driven workflows stall

**Recovery:**

1. Check NATS status:
   ```bash
   kubectl exec -it statefulset/nats -n aivo -- nats server info
   kubectl exec -it statefulset/nats -n aivo -- nats stream ls
   ```
2. Restart NATS:
   ```bash
   kubectl rollout restart statefulset/nats -n aivo
   ```
3. Verify JetStream streams are recovered:
   ```bash
   kubectl exec -it statefulset/nats -n aivo -- nats stream ls
   ```

---

## 4. Incident Severity Levels

| Level | Definition | Examples | Response Time |
|-------|-----------|----------|---------------|
| **SEV-1** | Complete service outage affecting all users | Region outage, database failure, identity-svc down | Immediate (< 15 min) |
| **SEV-2** | Major feature degradation affecting >50% of users | AI/tutor services down, billing failures | < 30 minutes |
| **SEV-3** | Partial degradation affecting <50% of users | Single non-critical service failure, elevated error rates | < 1 hour |
| **SEV-4** | Minor issue with workaround available | Slow performance, cosmetic issues | < 4 hours |

---

## 5. Communication Escalation Matrix

### On-Call Rotation

| Role | Primary Contact | Escalation |
|------|----------------|------------|
| **On-Call Engineer** | PagerDuty rotation | Auto-escalates after 15 min |
| **Platform Lead** | Escalation after 30 min unresolved | Direct contact |
| **CTO** | Escalation for SEV-1 after 1 hour | Direct contact |

### Communication Channels

| Audience | Channel | Timing |
|----------|---------|--------|
| Engineering team | Slack #incidents | Immediately on detection |
| Management | Slack #incidents-leadership | Within 15 minutes for SEV-1/2 |
| Customers | status.aivolearning.com | Within 30 minutes for SEV-1/2 |
| All stakeholders | Email post-mortem | Within 48 hours of resolution |

### Escalation Timeline

```
T+0 min    → Incident detected (automated alert or manual report)
T+5 min    → On-call engineer acknowledges, begins triage
T+15 min   → Auto-escalate if unacknowledged
T+30 min   → Platform Lead notified if unresolved SEV-1/2
T+60 min   → CTO notified for SEV-1
T+120 min  → Executive team notified for extended SEV-1
T+240 min  → RTO breach — full leadership war room
```

### Incident Communication Template

```
INCIDENT: [SEV-X] [Brief description]
STATUS: Investigating / Identified / Monitoring / Resolved
IMPACT: [User impact description]
SERVICES: [Affected services]
START TIME: [UTC timestamp]
ETA: [Estimated resolution time]
UPDATES: Every 30 minutes until resolved
```

---

## 6. Recovery Verification Checklist

After any recovery procedure, complete the following checks before declaring the incident resolved:

### Infrastructure Health

- [ ] All K3s nodes are in `Ready` state: `kubectl get nodes`
- [ ] All pods are in `Running` state: `kubectl get pods -n aivo`
- [ ] No pods in `CrashLoopBackOff` or `Error` state
- [ ] Node resource utilization is normal: `kubectl top nodes`

### Database Health

- [ ] PostgreSQL is accepting connections: `pg_isready -h 10.0.0.1 -p 5432`
- [ ] PgBouncer is routing connections: `psql -h 10.0.0.1 -p 6432 -c "SHOW POOLS"`
- [ ] Row counts match expected values (compare with pre-incident or backup counts)
- [ ] No orphaned foreign key references
- [ ] All database migrations are current

### Service Health

- [ ] All 15 services return 200 on health endpoints
- [ ] identity-svc: Authentication flow works end-to-end
- [ ] billing-svc: Stripe webhook processing is functional
- [ ] learning-svc: Session creation and progress tracking work
- [ ] tutor-svc: Tutor catalog loads, sessions can start
- [ ] ai-svc: LLM inference responds within acceptable latency
- [ ] brain-svc: Brain profile calculations return results
- [ ] comms-svc: WebSocket connections establish successfully
- [ ] engagement-svc: XP/badge queries return data

### Data Integrity

- [ ] Run `scripts/test-backup-restore.sh` to validate backup integrity
- [ ] Spot-check 10 random user accounts for data consistency
- [ ] Verify no duplicate records were created during recovery
- [ ] Confirm NATS JetStream consumers are caught up

### External Integrations

- [ ] Cloudflare DNS resolves correctly to new infrastructure (if changed)
- [ ] SSL/TLS certificates are valid
- [ ] Stripe webhooks are being received
- [ ] Email delivery (via comms-svc) is functional

---

## 7. Post-Incident Process

1. **Immediate (within 1 hour of resolution):**
   - Update status.aivolearning.com to "Resolved"
   - Send resolution notification to affected users
   - Remove any temporary resource overrides

2. **Within 24 hours:**
   - Schedule post-mortem meeting
   - Collect all relevant logs and metrics
   - Begin writing incident report

3. **Within 48 hours:**
   - Publish post-mortem document
   - Create action items for preventing recurrence
   - Update this playbook if procedures were inadequate

4. **Within 1 week:**
   - Complete all immediate action items
   - Schedule follow-up review for longer-term items

---

## 8. DR Testing Schedule

| Test Type | Frequency | Description |
|-----------|-----------|-------------|
| Backup restore validation | Weekly | Run `scripts/test-backup-restore.sh` |
| Single service failover | Monthly | Kill a random service pod, verify auto-recovery |
| Database restore drill | Quarterly | Full restore to ephemeral database |
| Full DR simulation | Annually | Simulate region outage, execute full playbook |

---

## 9. Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-01-01 | 1.0 | Platform Engineering | Initial playbook creation |
