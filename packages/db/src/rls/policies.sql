-- ─────────────────────────────────────────────
-- AIVO Learning Platform — Row Level Security Policies
-- Applied after schema push in CI and production
-- ─────────────────────────────────────────────

-- Enable RLS on tenant-scoped tables
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "families" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "billing_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "communications" ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Organization isolation policies
-- ─────────────────────────────────────────────

CREATE POLICY "org_isolation_organizations"
  ON "organizations"
  FOR ALL
  USING (id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_users"
  ON "users"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_students"
  ON "students"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_enrollments"
  ON "enrollments"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_courses"
  ON "courses"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_lessons"
  ON "lessons"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_assessments"
  ON "assessments"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_assessment_submissions"
  ON "assessment_submissions"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_engagement_events"
  ON "engagement_events"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_families"
  ON "families"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_family_members"
  ON "family_members"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_billing_subscriptions"
  ON "billing_subscriptions"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "org_isolation_communications"
  ON "communications"
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ─────────────────────────────────────────────
-- Service role bypass (for backend services)
-- ─────────────────────────────────────────────

CREATE POLICY "service_bypass_organizations"
  ON "organizations"
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "service_bypass_users"
  ON "users"
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "service_bypass_students"
  ON "students"
  FOR ALL
  TO service_role
  USING (true);
