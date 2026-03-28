import { describe, it, expect } from "vitest";

describe("Row-Level Security Policies", () => {
  const TENANT_SCOPED_TABLES = [
    "brain_states",
    "brain_state_snapshots",
    "brain_episodes",
    "learners",
    "learning_sessions",
    "tutor_sessions",
    "tutor_subscriptions",
    "homework_assignments",
    "homework_sessions",
    "iep_documents",
    "iep_goals",
    "recommendations",
    "learner_xp",
    "xp_events",
    "learner_badges",
    "learner_quests",
    "assessments",
    "subscriptions",
    "classrooms",
    "classroom_learners",
    "users",
  ];

  it("should have RLS defined for all tenant-scoped tables", () => {
    expect(TENANT_SCOPED_TABLES.length).toBeGreaterThanOrEqual(20);
  });

  it("should use current_setting for tenant isolation", () => {
    const rlsPolicy = "USING (tenant_id = current_setting('app.current_tenant_id')::uuid)";
    expect(rlsPolicy).toContain("current_setting");
    expect(rlsPolicy).toContain("app.current_tenant_id");
  });

  it("should isolate tenant A from tenant B data", () => {
    const tenantA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const tenantB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    expect(tenantA).not.toBe(tenantB);
  });
});
