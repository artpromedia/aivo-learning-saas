-- RLS Performance Benchmark Script
-- Tests query performance at different tenant scales
-- Usage: psql -U aivo -d aivo -f scripts/benchmark-rls.sql

\timing on

-- 1. Count current tenants and rows
SELECT 'Current tenant count' AS metric, count(*) AS value FROM tenants;
SELECT 'Current user count' AS metric, count(*) AS value FROM users;
SELECT 'Current learner count' AS metric, count(*) AS value FROM learners;

-- 2. Benchmark: Query with RLS context set (simulates single-tenant query)
DO $$
DECLARE
  test_tenant_id text;
  start_time timestamp;
  end_time timestamp;
  duration_ms numeric;
BEGIN
  SELECT id INTO test_tenant_id FROM tenants LIMIT 1;

  IF test_tenant_id IS NULL THEN
    RAISE NOTICE 'No tenants found — skipping RLS benchmark';
    RETURN;
  END IF;

  PERFORM set_config('app.current_org_id', test_tenant_id, true);

  -- Benchmark users query
  start_time := clock_timestamp();
  PERFORM count(*) FROM users WHERE tenant_id = test_tenant_id;
  end_time := clock_timestamp();
  duration_ms := extract(milliseconds FROM end_time - start_time);
  RAISE NOTICE 'Users query (tenant-filtered): % ms', duration_ms;

  -- Benchmark learners query
  start_time := clock_timestamp();
  PERFORM count(*) FROM learners;
  end_time := clock_timestamp();
  duration_ms := extract(milliseconds FROM end_time - start_time);
  RAISE NOTICE 'Learners query (RLS-filtered): % ms', duration_ms;

  -- Benchmark brain_states join query
  start_time := clock_timestamp();
  PERFORM count(*)
  FROM learners l
  LEFT JOIN brain_states bs ON bs.learner_id = l.id;
  end_time := clock_timestamp();
  duration_ms := extract(milliseconds FROM end_time - start_time);
  RAISE NOTICE 'Learners + brain_states join: % ms', duration_ms;

  -- Benchmark cross-tenant query (service role bypass)
  PERFORM set_config('app.current_org_id', '', true);
  start_time := clock_timestamp();
  PERFORM count(*) FROM users;
  end_time := clock_timestamp();
  duration_ms := extract(milliseconds FROM end_time - start_time);
  RAISE NOTICE 'Users query (no RLS filter): % ms', duration_ms;
END $$;

-- 3. Check index usage on tenant_id columns
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexdef LIKE '%tenant_id%'
ORDER BY tablename;

-- 4. Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Table sizes for partition planning
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS data_size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 30;

\timing off
