# Runbook: Database Issues

## Symptoms
- Services logging database connection errors
- Slow API responses (p95 > 1s)
- Prometheus `PostgresConnectionsNearLimit` alert
- `pg_stat_activity` shows high connection count

## Triage Steps

### 1. Check database health
```bash
kubectl exec -n aivo deploy/postgresql -- psql -U aivo -c "SELECT count(*) FROM pg_stat_activity;"
kubectl exec -n aivo deploy/postgresql -- psql -U aivo -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"
```

### 2. Check for long-running queries
```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC
LIMIT 10;
```

### 3. Check for locks
```sql
SELECT blocked.pid AS blocked_pid, blocking.pid AS blocking_pid,
       blocked.query AS blocked_query, blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_locks blocked_locks ON blocked.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocked_locks.locktype = blocking_locks.locktype
  AND blocked_locks.relation = blocking_locks.relation
  AND blocked_locks.pid != blocking_locks.pid
JOIN pg_stat_activity blocking ON blocking_locks.pid = blocking.pid
WHERE NOT blocked_locks.granted;
```

## Common Causes & Fixes

### Connection pool exhaustion
- **Fix**: Terminate idle connections, then investigate connection leaks
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND query_start < now() - interval '10 minutes';
```

### Slow queries
- **Fix**: Check `pg_stat_statements` for top queries by mean time
```sql
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```
- Add missing indexes based on sequential scan analysis

### Disk space
- **Fix**: Check tablespace usage
```sql
SELECT pg_size_pretty(pg_database_size('aivo'));
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;
```

### RLS policy issues
- **Symptom**: Queries return empty results unexpectedly
- **Fix**: Verify `app.current_org_id` is set correctly in the session
```sql
SHOW app.current_org_id;
```

## Backup & Recovery
- See `docs/backup-restore-runbook.md` for full backup/restore procedures
- See `docs/disaster-recovery-playbook.md` for DR scenarios
- Automated backup verification: `.github/workflows/backup-verify.yml`
