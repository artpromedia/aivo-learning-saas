-- Row-Level Security (RLS) Policies for Tenant Isolation
-- Applied to ALL tenant-scoped tables

-- Brain tables
ALTER TABLE brain_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY brain_states_tenant_isolation ON brain_states
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

ALTER TABLE brain_state_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY brain_state_snapshots_tenant_isolation ON brain_state_snapshots
  USING (brain_state_id IN (SELECT id FROM brain_states WHERE learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid)));

ALTER TABLE brain_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY brain_episodes_tenant_isolation ON brain_episodes
  USING (brain_state_id IN (SELECT id FROM brain_states WHERE learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid)));

-- Learner tables
ALTER TABLE learners ENABLE ROW LEVEL SECURITY;
CREATE POLICY learners_tenant_isolation ON learners
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Learning
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_sessions_tenant_isolation ON learning_sessions
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- Tutor
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tutor_sessions_tenant_isolation ON tutor_sessions
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

ALTER TABLE tutor_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tutor_subscriptions_tenant_isolation ON tutor_subscriptions
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- Homework
ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY homework_assignments_tenant_isolation ON homework_assignments
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

ALTER TABLE homework_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY homework_sessions_tenant_isolation ON homework_sessions
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- IEP
ALTER TABLE iep_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY iep_documents_tenant_isolation ON iep_documents
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

ALTER TABLE iep_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY iep_goals_tenant_isolation ON iep_goals
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- Recommendations
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY recommendations_tenant_isolation ON recommendations
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- Engagement / Gamification
ALTER TABLE learner_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY learner_xp_tenant_isolation ON learner_xp
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY xp_events_tenant_isolation ON xp_events
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

ALTER TABLE learner_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY learner_badges_tenant_isolation ON learner_badges
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

ALTER TABLE learner_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY learner_quests_tenant_isolation ON learner_quests
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- Assessment
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessments_tenant_isolation ON assessments
  USING (learner_id IN (SELECT id FROM learners WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_tenant_isolation ON subscriptions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Classrooms
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY classrooms_tenant_isolation ON classrooms
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE classroom_learners ENABLE ROW LEVEL SECURITY;
CREATE POLICY classroom_learners_tenant_isolation ON classroom_learners
  USING (classroom_id IN (SELECT id FROM classrooms WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Superuser bypass for platform admins (uses separate connection pool)
-- Platform admin connections should SET app.current_tenant_id = '00000000-0000-0000-0000-000000000000' which matches nothing,
-- then use a superuser role that bypasses RLS.
