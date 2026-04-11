# Database Failover Runbook

## Overview

This runbook covers promoting the PostgreSQL streaming replica (FSN1) to primary when the primary database (HEL1) is unavailable.

## Architecture

```
Primary (HEL1 - Helsinki)          Secondary (FSN1 - Falkenstein)
┌─────────────────────┐            ┌─────────────────────┐
│ PostgreSQL 16       │ ──WAL──>   │ PostgreSQL 16       │
│ Read/Write          │  stream    │ Hot Standby (R/O)    │
│ aivo-db-primary     │            │ aivo-db-replica-fsn1 │
└─────────────────────┘            └─────────────────────┘
```

## Monitoring

| Metric | Alert Threshold | Prometheus Query |
|--------|----------------|------------------|
| Replication lag | > 30 seconds | `pg_replication_lag_seconds > 30` |
| Replica connected | false | `pg_stat_replication_connected == 0` |
| WAL receiver status | not streaming | `pg_wal_receiver_status != 'streaming'` |

## Pre-Failover Checklist

- [ ] Confirm primary is truly unavailable (not just a network blip)
- [ ] Check replication lag on replica: `SELECT pg_last_xact_replay_timestamp();`
- [ ] Notify incident commander and stakeholders
- [ ] Estimate data loss (RPO): difference between last WAL replayed and current time
- [ ] Document the decision to failover with timestamp

## Failover Procedure

### Step 1: Verify Primary is Down

```bash
# From monitoring server or replica
pg_isready -h PRIMARY_IP -p 5432
# Should return "no response" or connection refused

# Check from Prometheus/Grafana
# Alert: PostgresDown should be firing
```

### Step 2: Check Replica Status

```bash
# SSH into replica server
ssh root@REPLICA_IP

# Check replication status
sudo -u postgres psql -c "SELECT pg_is_in_recovery(), pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn(), pg_last_xact_replay_timestamp();"

# Check for any pending WAL to replay
sudo -u postgres psql -c "SELECT pg_wal_lsn_diff(pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn()) AS bytes_behind;"
```

### Step 3: Promote Replica

```bash
# Promote the replica to primary
sudo -u postgres pg_ctl promote -D /var/lib/postgresql/16/main

# Verify promotion
sudo -u postgres psql -c "SELECT pg_is_in_recovery();"
# Should return: f (false - no longer in recovery)

# Remove standby signal
rm -f /var/lib/postgresql/16/main/standby.signal
```

### Step 4: Update Application Configuration

```bash
# Update DNS or connection strings to point to new primary
# Option A: Update DNS record
# aivo-db.internal -> REPLICA_IP

# Option B: Update Kubernetes secrets
kubectl -n aivo set env deployment --all DATABASE_URL="postgresql://aivo:PASSWORD@REPLICA_IP:5432/aivo"

# Option C: Update Helm values and upgrade
helm upgrade aivo-learning ./infra/helm \
  --set global.database.host=REPLICA_IP \
  --namespace aivo
```

### Step 5: Verify Application Connectivity

```bash
# Check all services can connect
for svc in identity-svc learning-svc engagement-svc family-svc tutor-svc billing-svc admin-svc assessment-svc; do
  echo "Checking $svc..."
  kubectl -n aivo exec deploy/$svc -- curl -s localhost:$PORT/health
done

# Run smoke tests
bash scripts/smoke-test.sh
```

### Step 6: Update Monitoring

```bash
# Update Prometheus targets
# Update Grafana datasources
# Verify alerting rules fire correctly
```

## Post-Failover Actions

### Immediate (Hour 1)

- [ ] Verify all services are operational
- [ ] Run smoke tests
- [ ] Monitor error rates in Sentry
- [ ] Notify stakeholders of successful failover

### Short-Term (Day 1)

- [ ] Investigate root cause of primary failure
- [ ] Plan for rebuilding the old primary as new replica
- [ ] Review data loss (if any)
- [ ] Update incident documentation

### Recovery (Day 2-7)

- [ ] Rebuild old primary server
- [ ] Configure as new streaming replica
- [ ] Verify replication is working
- [ ] Update failover documentation with lessons learned

## Rebuilding a Replica

After failover, rebuild the old primary as a replica:

```bash
# On the old primary server (now to become replica)
systemctl stop postgresql
rm -rf /var/lib/postgresql/16/main

# Base backup from new primary
sudo -u postgres pg_basebackup \
  -h NEW_PRIMARY_IP \
  -U replicator \
  -D /var/lib/postgresql/16/main \
  -Fp -Xs -P -R

# Create standby signal
touch /var/lib/postgresql/16/main/standby.signal
chown -R postgres:postgres /var/lib/postgresql/16/main

# Start as replica
systemctl start postgresql

# Verify
sudo -u postgres psql -c "SELECT pg_is_in_recovery();"
# Should return: t (true - in recovery/replica mode)
```

## SLA Targets

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | < 4 hours |
| RPO (Recovery Point Objective) | < 1 hour |
| Failover decision time | < 30 minutes |
| Failover execution time | < 15 minutes |
| Full validation time | < 30 minutes |
