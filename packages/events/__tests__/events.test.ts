import { describe, it, expect } from "vitest";
import {
  // Assessment
  AssessmentParentCompletedSchema,
  AssessmentIepUploadedSchema,
  AssessmentIepParsedSchema,
  AssessmentIepConfirmedSchema,
  AssessmentBaselineStartedSchema,
  AssessmentBaselineCompletedSchema,
  // Brain
  BrainClonedSchema,
  BrainUpdatedSchema,
  BrainSnapshotCreatedSchema,
  BrainMasteryUpdatedSchema,
  BrainRecommendationCreatedSchema,
  BrainRecommendationRespondedSchema,
  BrainIepGoalMetSchema,
  BrainFunctioningLevelChangedSchema,
  BrainRegressionDetectedSchema,
  // Tutor
  TutorAddonActivatedSchema,
  TutorAddonDeactivatedSchema,
  TutorSessionStartedSchema,
  TutorSessionCompletedSchema,
  // Homework
  HomeworkUploadedSchema,
  HomeworkProcessedSchema,
  HomeworkSessionStartedSchema,
  HomeworkSessionCompletedSchema,
  // Learning
  LessonCompletedSchema,
  QuizCompletedSchema,
  QuizPerfectScoreSchema,
  // Engagement
  EngagementXpEarnedSchema,
  EngagementLevelUpSchema,
  EngagementBadgeEarnedSchema,
  EngagementStreakExtendedSchema,
  EngagementStreakBrokenSchema,
  EngagementChallengeCompletedSchema,
  EngagementShopPurchasedSchema,
  FocusSession30minSchema,
  FocusSession90minSchema,
  BreakCompletedSchema,
  // Billing
  BillingSubscriptionCreatedSchema,
  BillingSubscriptionCancelledSchema,
  BillingPaymentSucceededSchema,
  BillingPaymentFailedSchema,
  // Comms
  CommsEmailSendSchema,
  CommsPushSendSchema,
  CommsNotificationCreatedSchema,
  // Identity
  IdentityUserCreatedSchema,
  IdentityUserInvitedSchema,
  IdentityLearnerCreatedSchema,
  // Subjects
  SUBJECTS,
  // JetStream
  JETSTREAM_STREAMS,
} from "../src/index.js";

function uuid(): string {
  return crypto.randomUUID();
}

// ─── Assessment Events ──────────────────────────────────────────────────────────
describe("Assessment Events", () => {
  it("validates assessment.parent.completed", () => {
    const valid = { learnerId: uuid(), parentId: uuid(), responses: { q1: "a" }, functioningLevelSignals: { sign1: true } };
    expect(AssessmentParentCompletedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects assessment.parent.completed with invalid UUID", () => {
    expect(() => AssessmentParentCompletedSchema.parse({ learnerId: "bad", parentId: uuid(), responses: {}, functioningLevelSignals: {} })).toThrow();
  });

  it("validates assessment.iep.uploaded", () => {
    const valid = { learnerId: uuid(), documentId: uuid(), fileUrl: "https://example.com/doc.pdf" };
    expect(AssessmentIepUploadedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects assessment.iep.uploaded with invalid URL", () => {
    expect(() => AssessmentIepUploadedSchema.parse({ learnerId: uuid(), documentId: uuid(), fileUrl: "not-a-url" })).toThrow();
  });

  it("validates assessment.iep.parsed", () => {
    const valid = { learnerId: uuid(), documentId: uuid(), parsedData: { goals: [] } };
    expect(AssessmentIepParsedSchema.parse(valid)).toEqual(valid);
  });

  it("validates assessment.iep.confirmed", () => {
    const valid = { learnerId: uuid(), documentId: uuid(), confirmedBy: uuid() };
    expect(AssessmentIepConfirmedSchema.parse(valid)).toEqual(valid);
  });

  it("validates assessment.baseline.started", () => {
    const valid = { learnerId: uuid(), assessmentMode: "STANDARD" as const };
    expect(AssessmentBaselineStartedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects assessment.baseline.started with bad mode", () => {
    expect(() => AssessmentBaselineStartedSchema.parse({ learnerId: uuid(), assessmentMode: "INVALID" })).toThrow();
  });

  it("validates assessment.baseline.completed", () => {
    const valid = { learnerId: uuid(), assessmentId: uuid(), domains: { math: 0.8, reading: 0.65 }, functioningLevel: "SUPPORTED" as const };
    expect(AssessmentBaselineCompletedSchema.parse(valid)).toEqual(valid);
  });
});

// ─── Brain Events ───────────────────────────────────────────────────────────────
describe("Brain Events", () => {
  it("validates brain.cloned", () => {
    const valid = { learnerId: uuid(), brainStateId: uuid(), mainBrainVersion: "1.0.0", functioningLevel: "STANDARD" as const };
    expect(BrainClonedSchema.parse(valid)).toEqual(valid);
  });

  it("validates brain.updated", () => {
    const valid = { learnerId: uuid(), brainStateId: uuid(), updateType: "mastery", changes: { math: 0.9 } };
    expect(BrainUpdatedSchema.parse(valid)).toEqual(valid);
  });

  it("validates brain.snapshot.created", () => {
    const valid = { learnerId: uuid(), snapshotId: uuid(), trigger: "INITIAL_CLONE" as const };
    expect(BrainSnapshotCreatedSchema.parse(valid)).toEqual(valid);
  });

  it("validates brain.mastery.updated", () => {
    const valid = { learnerId: uuid(), subject: "math", skill: "addition", previousLevel: 0.5, newLevel: 0.8 };
    expect(BrainMasteryUpdatedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects brain.mastery.updated with level > 1", () => {
    expect(() => BrainMasteryUpdatedSchema.parse({ learnerId: uuid(), subject: "math", skill: "addition", previousLevel: 0.5, newLevel: 1.5 })).toThrow();
  });

  it("validates brain.recommendation.created", () => {
    const valid = { learnerId: uuid(), recommendationId: uuid(), type: "CURRICULUM_ADJUSTMENT" };
    expect(BrainRecommendationCreatedSchema.parse(valid)).toEqual(valid);
  });

  it("validates brain.recommendation.responded", () => {
    const valid = { learnerId: uuid(), recommendationId: uuid(), status: "APPROVED" as const, parentResponse: "Looks good" };
    expect(BrainRecommendationRespondedSchema.parse(valid)).toEqual(valid);
  });

  it("validates brain.iep_goal.met", () => {
    const valid = { learnerId: uuid(), goalId: uuid(), goalText: "Count to 20" };
    expect(BrainIepGoalMetSchema.parse(valid)).toEqual(valid);
  });

  it("validates brain.functioning_level.changed", () => {
    const valid = { learnerId: uuid(), previousLevel: "NON_VERBAL" as const, newLevel: "LOW_VERBAL" as const };
    expect(BrainFunctioningLevelChangedSchema.parse(valid)).toEqual(valid);
  });

  it("validates brain.regression.detected", () => {
    const valid = { learnerId: uuid(), domain: "reading", dropPercent: 15 };
    expect(BrainRegressionDetectedSchema.parse(valid)).toEqual(valid);
  });
});

// ─── Tutor Events ───────────────────────────────────────────────────────────────
describe("Tutor Events", () => {
  it("validates tutor.addon.activated", () => {
    const valid = { learnerId: uuid(), tenantId: uuid(), sku: "ADDON_TUTOR_MATH" as const, subject: "math" };
    expect(TutorAddonActivatedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects tutor.addon.activated with invalid SKU", () => {
    expect(() => TutorAddonActivatedSchema.parse({ learnerId: uuid(), tenantId: uuid(), sku: "INVALID", subject: "math" })).toThrow();
  });

  it("validates tutor.addon.deactivated", () => {
    const valid = { learnerId: uuid(), tenantId: uuid(), sku: "ADDON_TUTOR_ELA" as const };
    expect(TutorAddonDeactivatedSchema.parse(valid)).toEqual(valid);
  });

  it("validates tutor.session.started", () => {
    const valid = { learnerId: uuid(), tutorSku: "ADDON_TUTOR_SCIENCE" as const, sessionId: uuid() };
    expect(TutorSessionStartedSchema.parse(valid)).toEqual(valid);
  });

  it("validates tutor.session.completed", () => {
    const valid = { learnerId: uuid(), tutorSku: "ADDON_TUTOR_CODING" as const, sessionId: uuid(), masteryUpdates: { skill: 0.9 }, engagementMetrics: { focus: 0.8 } };
    expect(TutorSessionCompletedSchema.parse(valid)).toEqual(valid);
  });
});

// ─── Homework Events ────────────────────────────────────────────────────────────
describe("Homework Events", () => {
  it("validates homework.uploaded", () => {
    const valid = { learnerId: uuid(), assignmentId: uuid(), subject: "math", fileUrl: "https://cdn.aivo.com/hw.pdf" };
    expect(HomeworkUploadedSchema.parse(valid)).toEqual(valid);
  });

  it("validates homework.processed", () => {
    const valid = { learnerId: uuid(), assignmentId: uuid(), problemCount: 10 };
    expect(HomeworkProcessedSchema.parse(valid)).toEqual(valid);
  });

  it("validates homework.session.started", () => {
    const valid = { learnerId: uuid(), assignmentId: uuid(), sessionId: uuid() };
    expect(HomeworkSessionStartedSchema.parse(valid)).toEqual(valid);
  });

  it("validates homework.session.completed", () => {
    const valid = { learnerId: uuid(), assignmentId: uuid(), sessionId: uuid(), subject: "math", completionQuality: 0.85, problemsCompleted: 8, hintsUsed: 2, durationSeconds: 1200 };
    expect(HomeworkSessionCompletedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects homework.session.completed with quality > 1", () => {
    expect(() => HomeworkSessionCompletedSchema.parse({ learnerId: uuid(), assignmentId: uuid(), sessionId: uuid(), subject: "math", completionQuality: 1.5, problemsCompleted: 8, hintsUsed: 2, durationSeconds: 1200 })).toThrow();
  });
});

// ─── Learning Events ────────────────────────────────────────────────────────────
describe("Learning Events", () => {
  it("validates lesson.completed", () => {
    const valid = { learnerId: uuid(), sessionId: uuid(), subject: "math", skill: "fractions", masteryDelta: 0.05 };
    expect(LessonCompletedSchema.parse(valid)).toEqual(valid);
  });

  it("validates quiz.completed", () => {
    const valid = { learnerId: uuid(), sessionId: uuid(), subject: "reading", score: 0.9, totalQuestions: 10 };
    expect(QuizCompletedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects quiz.completed with totalQuestions = 0", () => {
    expect(() => QuizCompletedSchema.parse({ learnerId: uuid(), sessionId: uuid(), subject: "reading", score: 0.9, totalQuestions: 0 })).toThrow();
  });

  it("validates quiz.perfect_score", () => {
    const valid = { learnerId: uuid(), sessionId: uuid(), subject: "science" };
    expect(QuizPerfectScoreSchema.parse(valid)).toEqual(valid);
  });
});

// ─── Engagement Events ──────────────────────────────────────────────────────────
describe("Engagement Events", () => {
  it("validates engagement.xp.earned", () => {
    const valid = { learnerId: uuid(), xpAmount: 50, activity: "lesson_completed", triggerEvent: "lesson.completed" };
    expect(EngagementXpEarnedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects engagement.xp.earned with xpAmount = 0", () => {
    expect(() => EngagementXpEarnedSchema.parse({ learnerId: uuid(), xpAmount: 0, activity: "test", triggerEvent: "test" })).toThrow();
  });

  it("validates engagement.level.up", () => {
    const valid = { learnerId: uuid(), newLevel: 5, totalXp: 500 };
    expect(EngagementLevelUpSchema.parse(valid)).toEqual(valid);
  });

  it("validates engagement.badge.earned", () => {
    const valid = { learnerId: uuid(), badgeSlug: "first-lesson" };
    expect(EngagementBadgeEarnedSchema.parse(valid)).toEqual(valid);
  });

  it("validates engagement.streak.extended", () => {
    const valid = { learnerId: uuid(), currentStreak: 7 };
    expect(EngagementStreakExtendedSchema.parse(valid)).toEqual(valid);
  });

  it("validates engagement.streak.broken", () => {
    const valid = { learnerId: uuid(), previousStreak: 14 };
    expect(EngagementStreakBrokenSchema.parse(valid)).toEqual(valid);
  });

  it("validates engagement.challenge.completed", () => {
    const valid = { learnerId: uuid(), challengeId: uuid(), won: true };
    expect(EngagementChallengeCompletedSchema.parse(valid)).toEqual(valid);
  });

  it("validates engagement.shop.purchased", () => {
    const valid = { learnerId: uuid(), itemId: "avatar-hat-01", cost: 100 };
    expect(EngagementShopPurchasedSchema.parse(valid)).toEqual(valid);
  });

  it("validates focus.session_30min", () => {
    const valid = { learnerId: uuid(), sessionId: uuid() };
    expect(FocusSession30minSchema.parse(valid)).toEqual(valid);
  });

  it("validates focus.session_90min", () => {
    const valid = { learnerId: uuid(), sessionId: uuid() };
    expect(FocusSession90minSchema.parse(valid)).toEqual(valid);
  });

  it("validates break.completed", () => {
    const valid = { learnerId: uuid() };
    expect(BreakCompletedSchema.parse(valid)).toEqual(valid);
  });
});

// ─── Billing Events ─────────────────────────────────────────────────────────────
describe("Billing Events", () => {
  it("validates billing.subscription.created", () => {
    const valid = { tenantId: uuid(), subscriptionId: uuid(), planId: "family_monthly" };
    expect(BillingSubscriptionCreatedSchema.parse(valid)).toEqual(valid);
  });

  it("validates billing.subscription.cancelled", () => {
    const valid = { tenantId: uuid(), subscriptionId: uuid(), graceEndsAt: "2026-04-01T00:00:00Z" };
    expect(BillingSubscriptionCancelledSchema.parse(valid)).toEqual(valid);
  });

  it("rejects billing.subscription.cancelled with bad datetime", () => {
    expect(() => BillingSubscriptionCancelledSchema.parse({ tenantId: uuid(), subscriptionId: uuid(), graceEndsAt: "not-a-date" })).toThrow();
  });

  it("validates billing.payment.succeeded", () => {
    const valid = { tenantId: uuid(), amount: 29.99, invoiceId: "inv_123" };
    expect(BillingPaymentSucceededSchema.parse(valid)).toEqual(valid);
  });

  it("validates billing.payment.failed", () => {
    const valid = { tenantId: uuid(), invoiceId: "inv_456", retryAt: "2026-04-02T12:00:00Z" };
    expect(BillingPaymentFailedSchema.parse(valid)).toEqual(valid);
  });
});

// ─── Comms Events ───────────────────────────────────────────────────────────────
describe("Comms Events", () => {
  it("validates comms.email.send", () => {
    const valid = { templateSlug: "welcome", recipientEmail: "test@example.com", recipientName: "Test User", templateData: { name: "Test" }, tags: ["onboarding"] };
    expect(CommsEmailSendSchema.parse(valid)).toEqual(valid);
  });

  it("rejects comms.email.send with invalid email", () => {
    expect(() => CommsEmailSendSchema.parse({ templateSlug: "welcome", recipientEmail: "bad-email", recipientName: "Test", templateData: {}, tags: [] })).toThrow();
  });

  it("validates comms.push.send", () => {
    const valid = { userId: uuid(), title: "New Badge!", body: "You earned First Lesson", data: { badgeSlug: "first-lesson" } };
    expect(CommsPushSendSchema.parse(valid)).toEqual(valid);
  });

  it("validates comms.notification.created", () => {
    const valid = { userId: uuid(), type: "badge", title: "Badge Earned", body: "You earned a badge!", actionUrl: "/badges" };
    expect(CommsNotificationCreatedSchema.parse(valid)).toEqual(valid);
  });
});

// ─── Identity Events ────────────────────────────────────────────────────────────
describe("Identity Events", () => {
  it("validates identity.user.created", () => {
    const valid = { userId: uuid(), tenantId: uuid(), role: "PARENT" as const, email: "parent@example.com" };
    expect(IdentityUserCreatedSchema.parse(valid)).toEqual(valid);
  });

  it("rejects identity.user.created with invalid role", () => {
    expect(() => IdentityUserCreatedSchema.parse({ userId: uuid(), tenantId: uuid(), role: "INVALID", email: "t@t.com" })).toThrow();
  });

  it("validates identity.user.invited", () => {
    const valid = { userId: uuid(), invitedBy: uuid(), role: "CAREGIVER" as const };
    expect(IdentityUserInvitedSchema.parse(valid)).toEqual(valid);
  });

  it("validates identity.learner.created", () => {
    const valid = { learnerId: uuid(), tenantId: uuid(), parentId: uuid() };
    expect(IdentityLearnerCreatedSchema.parse(valid)).toEqual(valid);
  });
});

// ─── SUBJECTS constant ─────────────────────────────────────────────────────────
describe("SUBJECTS constant", () => {
  it("should include all 69 event subjects", () => {
    const subjectCount = Object.keys(SUBJECTS).length;
    expect(subjectCount).toBe(69);
  });

  it("all subjects should start with 'aivo.'", () => {
    for (const subject of Object.values(SUBJECTS)) {
      expect(subject).toMatch(/^aivo\./);
    }
  });
});

// ─── JetStream Streams ─────────────────────────────────────────────────────────
describe("JetStream Streams", () => {
  it("should define 10 streams", () => {
    expect(JETSTREAM_STREAMS).toHaveLength(10);
  });

  it("all streams should have valid configurations", () => {
    for (const stream of JETSTREAM_STREAMS) {
      expect(stream.name).toBeTruthy();
      expect(stream.subjects.length).toBeGreaterThan(0);
      expect(["limits", "interest", "workqueue"]).toContain(stream.retention);
      expect(["file", "memory"]).toContain(stream.storage);
      expect(stream.maxAge).toBeGreaterThan(0);
      expect(stream.maxBytes).toBeGreaterThan(0);
    }
  });
});
