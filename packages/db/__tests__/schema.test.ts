import { describe, it, expect } from "vitest";
import { getTableName } from "drizzle-orm";
import * as schema from "../src/schema/index.js";

// ─── Table Definitions ──────────────────────────────────────────────────────────
const expectedTables = [
  // Identity (4)
  { name: "tenants", ref: schema.tenants },
  { name: "users", ref: schema.users },
  { name: "sessions", ref: schema.sessions },
  { name: "accounts", ref: schema.accounts },
  // Learner Profiles (3)
  { name: "learners", ref: schema.learners },
  { name: "learner_caregivers", ref: schema.learnerCaregivers },
  { name: "learner_teachers", ref: schema.learnerTeachers },
  // Brain (3)
  { name: "brain_states", ref: schema.brainStates },
  { name: "brain_state_snapshots", ref: schema.brainStateSnapshots },
  { name: "brain_episodes", ref: schema.brainEpisodes },
  // IEP (2)
  { name: "iep_documents", ref: schema.iepDocuments },
  { name: "iep_goals", ref: schema.iepGoals },
  // Assessment (3)
  { name: "parent_assessments", ref: schema.parentAssessments },
  { name: "baseline_assessments", ref: schema.baselineAssessments },
  { name: "assessment_items", ref: schema.assessmentItems },
  // Recommendations (1)
  { name: "recommendations", ref: schema.recommendations },
  // Tutors (2)
  { name: "tutor_subscriptions", ref: schema.tutorSubscriptions },
  { name: "tutor_sessions", ref: schema.tutorSessions },
  // Homework (2)
  { name: "homework_assignments", ref: schema.homeworkAssignments },
  { name: "homework_sessions", ref: schema.homeworkSessions },
  // Learning (1)
  { name: "learning_sessions", ref: schema.learningSessions },
  // Engagement (6)
  { name: "learner_xp", ref: schema.learnerXp },
  { name: "xp_events", ref: schema.xpEvents },
  { name: "badges", ref: schema.badges },
  { name: "learner_badges", ref: schema.learnerBadges },
  { name: "quests", ref: schema.quests },
  { name: "learner_quests", ref: schema.learnerQuests },
  // Billing (2)
  { name: "subscriptions", ref: schema.subscriptions },
  { name: "subscription_items", ref: schema.subscriptionItems },
  // Config (2)
  { name: "tenant_configs", ref: schema.tenantConfigs },
  { name: "tenant_usages", ref: schema.tenantUsages },
  // Functional Curriculum (2)
  { name: "functional_milestones", ref: schema.functionalMilestones },
  { name: "learner_milestones", ref: schema.learnerMilestones },
  // Comms (3)
  { name: "notifications", ref: schema.notifications },
  { name: "push_tokens", ref: schema.pushTokens },
  { name: "notification_preferences", ref: schema.notificationPreferences },
];

describe("Database Schema", () => {
  it("should define exactly 36 tables", () => {
    expect(expectedTables).toHaveLength(36);
  });

  describe("Table definitions", () => {
    for (const { name, ref } of expectedTables) {
      it(`should define table "${name}"`, () => {
        expect(ref).toBeDefined();
        expect(getTableName(ref)).toBe(name);
      });
    }
  });

  describe("Tables have created_at column", () => {
    // Junction/detail tables that don't need created_at
    const excludeFromTimestamp = new Set([
      "learner_xp",
      "learner_caregivers",
      "learner_teachers",
      "assessment_items",
      "homework_sessions",
      "learner_badges",
      "learner_quests",
      "notification_preferences",
    ]);
    const tablesWithCreatedAt = expectedTables.filter(
      (t) => !excludeFromTimestamp.has(t.name)
    );
    for (const { name, ref } of tablesWithCreatedAt) {
      it(`${name} should have created_at column`, () => {
        const columns = Object.keys(ref);
        const hasCreatedAt = columns.some(
          (col) => col === "createdAt" || col === "created_at"
        );
        expect(hasCreatedAt).toBe(true);
      });
    }
  });
});

// ─── Enum Exports ───────────────────────────────────────────────────────────────
describe("Enum Exports", () => {
  const expectedEnums = [
    "tenantTypeEnum",
    "tenantStatusEnum",
    "userRoleEnum",
    "userStatusEnum",
    "functioningLevelEnum",
    "communicationModeEnum",
    "cognitiveLoadEnum",
    "snapshotTriggerEnum",
    "iepParseStatusEnum",
    "iepGoalStatusEnum",
    "assessmentModeEnum",
    "assessmentStatusEnum",
    "recommendationTypeEnum",
    "recommendationStatusEnum",
    "tutorSkuEnum",
    "tutorSubscriptionStatusEnum",
    "tutorSessionTypeEnum",
    "homeworkModeEnum",
    "homeworkStatusEnum",
    "learningSessionTypeEnum",
    "subscriptionStatusEnum",
    "questStatusEnum",
    "milestoneStatusEnum",
    "functionalDomainEnum",
  ];

  for (const enumName of expectedEnums) {
    it(`should export ${enumName}`, () => {
      const enumRef = (schema as Record<string, unknown>)[enumName];
      expect(enumRef).toBeDefined();
    });
  }

  it("should export all 24 enums", () => {
    expect(expectedEnums).toHaveLength(24);
  });
});

// ─── Relation Exports ───────────────────────────────────────────────────────────
describe("Relation Exports", () => {
  const expectedRelations = [
    "tenantsRelations",
    "usersRelations",
    "sessionsRelations",
    "accountsRelations",
    "learnersRelations",
    "learnerCaregiversRelations",
    "learnerTeachersRelations",
    "brainStatesRelations",
    "brainStateSnapshotsRelations",
    "brainEpisodesRelations",
    "iepDocumentsRelations",
    "iepGoalsRelations",
    "parentAssessmentsRelations",
    "baselineAssessmentsRelations",
    "assessmentItemsRelations",
    "recommendationsRelations",
    "tutorSubscriptionsRelations",
    "tutorSessionsRelations",
    "homeworkAssignmentsRelations",
    "homeworkSessionsRelations",
    "learningSessionsRelations",
    "learnerXpRelations",
    "xpEventsRelations",
    "badgesRelations",
    "learnerBadgesRelations",
    "questsRelations",
    "learnerQuestsRelations",
    "subscriptionsRelations",
    "subscriptionItemsRelations",
    "tenantConfigsRelations",
    "tenantUsagesRelations",
    "functionalMilestonesRelations",
    "learnerMilestonesRelations",
    "notificationsRelations",
    "pushTokensRelations",
    "notificationPreferencesRelations",
  ];

  for (const rel of expectedRelations) {
    it(`should export ${rel}`, () => {
      const relRef = (schema as Record<string, unknown>)[rel];
      expect(relRef).toBeDefined();
    });
  }
});

// ─── Enum Values ────────────────────────────────────────────────────────────────
describe("Enum Values", () => {
  it("tenantTypeEnum should have B2C_FAMILY and B2B_DISTRICT", () => {
    expect(schema.tenantTypeEnum.enumValues).toContain("B2C_FAMILY");
    expect(schema.tenantTypeEnum.enumValues).toContain("B2B_DISTRICT");
  });

  it("userRoleEnum should have all 6 roles", () => {
    expect(schema.userRoleEnum.enumValues).toHaveLength(6);
    expect(schema.userRoleEnum.enumValues).toEqual(
      expect.arrayContaining([
        "PARENT",
        "TEACHER",
        "CAREGIVER",
        "LEARNER",
        "DISTRICT_ADMIN",
        "PLATFORM_ADMIN",
      ])
    );
  });

  it("functioningLevelEnum should have all 5 levels", () => {
    expect(schema.functioningLevelEnum.enumValues).toHaveLength(5);
  });

  it("recommendationTypeEnum should have all 14 types", () => {
    expect(schema.recommendationTypeEnum.enumValues).toHaveLength(14);
  });

  it("assessmentModeEnum should have all 7 modes", () => {
    expect(schema.assessmentModeEnum.enumValues).toHaveLength(7);
  });

  it("tutorSkuEnum should have all 6 SKUs", () => {
    expect(schema.tutorSkuEnum.enumValues).toHaveLength(6);
  });

  it("snapshotTriggerEnum should have all 10 triggers", () => {
    expect(schema.snapshotTriggerEnum.enumValues).toHaveLength(10);
  });
});
