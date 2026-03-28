import { z } from "zod";

// ─── brain.cloned ───────────────────────────────────────────────────────────────
export const BrainClonedSchema = z.object({
  learnerId: z.string().uuid(),
  brainStateId: z.string().uuid(),
  mainBrainVersion: z.string(),
  functioningLevel: z.enum([
    "STANDARD",
    "SUPPORTED",
    "LOW_VERBAL",
    "NON_VERBAL",
    "PRE_SYMBOLIC",
  ]),
});
export type BrainCloned = z.infer<typeof BrainClonedSchema>;

// ─── brain.updated ──────────────────────────────────────────────────────────────
export const BrainUpdatedSchema = z.object({
  learnerId: z.string().uuid(),
  brainStateId: z.string().uuid(),
  updateType: z.string(),
  changes: z.record(z.string(), z.unknown()),
});
export type BrainUpdated = z.infer<typeof BrainUpdatedSchema>;

// ─── brain.snapshot.created ─────────────────────────────────────────────────────
export const BrainSnapshotCreatedSchema = z.object({
  learnerId: z.string().uuid(),
  snapshotId: z.string().uuid(),
  trigger: z.enum([
    "INITIAL_CLONE",
    "MAIN_BRAIN_UPGRADE",
    "PARENT_APPROVED",
    "MASTERY_THRESHOLD",
    "REBASELINE",
    "TUTOR_ADDON_ACTIVATED",
    "TUTOR_ADDON_DEACTIVATED",
    "FUNCTIONING_LEVEL_CHANGE",
    "IEP_UPDATE",
    "ROLLBACK",
  ]),
});
export type BrainSnapshotCreated = z.infer<typeof BrainSnapshotCreatedSchema>;

// ─── brain.mastery.updated ──────────────────────────────────────────────────────
export const BrainMasteryUpdatedSchema = z.object({
  learnerId: z.string().uuid(),
  subject: z.string(),
  skill: z.string(),
  previousLevel: z.number().min(0).max(1),
  newLevel: z.number().min(0).max(1),
});
export type BrainMasteryUpdated = z.infer<typeof BrainMasteryUpdatedSchema>;

// ─── brain.recommendation.created ───────────────────────────────────────────────
export const BrainRecommendationCreatedSchema = z.object({
  learnerId: z.string().uuid(),
  recommendationId: z.string().uuid(),
  type: z.string(),
});
export type BrainRecommendationCreated = z.infer<typeof BrainRecommendationCreatedSchema>;

// ─── brain.recommendation.responded ─────────────────────────────────────────────
export const BrainRecommendationRespondedSchema = z.object({
  learnerId: z.string().uuid(),
  recommendationId: z.string().uuid(),
  status: z.enum(["APPROVED", "DECLINED", "ADJUSTED"]),
  parentResponse: z.string().optional(),
});
export type BrainRecommendationResponded = z.infer<typeof BrainRecommendationRespondedSchema>;

// ─── brain.iep_goal.met ─────────────────────────────────────────────────────────
export const BrainIepGoalMetSchema = z.object({
  learnerId: z.string().uuid(),
  goalId: z.string().uuid(),
  goalText: z.string(),
});
export type BrainIepGoalMet = z.infer<typeof BrainIepGoalMetSchema>;

// ─── brain.functioning_level.changed ────────────────────────────────────────────
export const BrainFunctioningLevelChangedSchema = z.object({
  learnerId: z.string().uuid(),
  previousLevel: z.enum([
    "STANDARD",
    "SUPPORTED",
    "LOW_VERBAL",
    "NON_VERBAL",
    "PRE_SYMBOLIC",
  ]),
  newLevel: z.enum([
    "STANDARD",
    "SUPPORTED",
    "LOW_VERBAL",
    "NON_VERBAL",
    "PRE_SYMBOLIC",
  ]),
});
export type BrainFunctioningLevelChanged = z.infer<typeof BrainFunctioningLevelChangedSchema>;

// ─── brain.regression.detected ──────────────────────────────────────────────────
export const BrainRegressionDetectedSchema = z.object({
  learnerId: z.string().uuid(),
  domain: z.string(),
  dropPercent: z.number().min(0).max(100),
});
export type BrainRegressionDetected = z.infer<typeof BrainRegressionDetectedSchema>;

// ─── brain.upgraded ────────────────────────────────────────────────────────────
export const BrainUpgradedSchema = z.object({
  learnerId: z.string().uuid(),
  brainStateId: z.string().uuid(),
  previousVersion: z.string(),
  newVersion: z.string(),
});
export type BrainUpgraded = z.infer<typeof BrainUpgradedSchema>;

// ─── brain.upgrade.batch.completed ─────────────────────────────────────────────
export const BrainUpgradeBatchCompletedSchema = z.object({
  version: z.string(),
  totalUpgraded: z.number(),
  totalFailed: z.number(),
  durationMs: z.number(),
});
export type BrainUpgradeBatchCompleted = z.infer<typeof BrainUpgradeBatchCompletedSchema>;

// ─── brain.snapshot.restored ───────────────────────────────────────────────────
export const BrainSnapshotRestoredSchema = z.object({
  learnerId: z.string().uuid(),
  snapshotId: z.string().uuid(),
  restoredBy: z.string().uuid(),
});
export type BrainSnapshotRestored = z.infer<typeof BrainSnapshotRestoredSchema>;

export const BRAIN_SUBJECTS = {
  "brain.cloned": "aivo.brain.cloned",
  "brain.updated": "aivo.brain.updated",
  "brain.snapshot.created": "aivo.brain.snapshot.created",
  "brain.mastery.updated": "aivo.brain.mastery.updated",
  "brain.recommendation.created": "aivo.brain.recommendation.created",
  "brain.recommendation.responded": "aivo.brain.recommendation.responded",
  "brain.iep_goal.met": "aivo.brain.iep_goal.met",
  "brain.functioning_level.changed": "aivo.brain.functioning_level.changed",
  "brain.regression.detected": "aivo.brain.regression.detected",
  "brain.upgraded": "aivo.brain.upgraded",
  "brain.upgrade.batch.completed": "aivo.brain.upgrade.batch.completed",
  "brain.snapshot.restored": "aivo.brain.snapshot.restored",
} as const;

export const BRAIN_SCHEMAS = {
  "brain.cloned": BrainClonedSchema,
  "brain.updated": BrainUpdatedSchema,
  "brain.snapshot.created": BrainSnapshotCreatedSchema,
  "brain.mastery.updated": BrainMasteryUpdatedSchema,
  "brain.recommendation.created": BrainRecommendationCreatedSchema,
  "brain.recommendation.responded": BrainRecommendationRespondedSchema,
  "brain.iep_goal.met": BrainIepGoalMetSchema,
  "brain.functioning_level.changed": BrainFunctioningLevelChangedSchema,
  "brain.regression.detected": BrainRegressionDetectedSchema,
  "brain.upgraded": BrainUpgradedSchema,
  "brain.upgrade.batch.completed": BrainUpgradeBatchCompletedSchema,
  "brain.snapshot.restored": BrainSnapshotRestoredSchema,
} as const;
