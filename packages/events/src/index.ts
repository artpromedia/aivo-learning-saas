export const EVENTS = {
  ASSESSMENT_COMPLETED: "assessment.completed",
  ASSESSMENT_STARTED: "assessment.started",
  BRAIN_CLONE_REQUESTED: "brain.clone.requested",
  BRAIN_CLONE_COMPLETED: "brain.clone.completed",
  BRAIN_SNAPSHOT_CREATED: "brain.snapshot.created",
  BRAIN_RECOMMENDATION_CREATED: "brain.recommendation.created",
  BRAIN_RECOMMENDATION_RESOLVED: "brain.recommendation.resolved",
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
  LEARNER_CREATED: "learner.created",
  LEARNER_LEVEL_CHANGED: "learner.level_changed",
  IEP_UPLOADED: "iep.uploaded",
  IEP_PARSED: "iep.parsed",
  XP_EARNED: "engagement.xp_earned",
  BADGE_AWARDED: "engagement.badge_awarded",
  STREAK_UPDATED: "engagement.streak_updated",
  TUTOR_ACTIVATED: "tutor.activated",
  TUTOR_DEACTIVATED: "tutor.deactivated",
  CONSENT_GRANTED: "consent.granted",
  CONSENT_REVOKED: "consent.revoked",
  SUBSCRIPTION_CHANGED: "subscription.changed",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export interface AivoEvent<T = unknown> {
  id: string;
  type: EventName;
  tenantId: string;
  timestamp: string;
  payload: T;
  source: string;
}

export interface AssessmentCompletedPayload {
  attemptId: string;
  learnerId: string;
  type: string;
  domainScores: Record<string, number>;
}

export interface BrainCloneRequestedPayload {
  learnerId: string;
  assessmentId: string;
  functioningLevel: string;
  parentAssessmentId?: string;
  iepProfileId?: string;
}

export interface BrainCloneCompletedPayload {
  learnerId: string;
  brainStateId: string;
  snapshotId: string;
  version: number;
}

export interface LearnerLevelChangedPayload {
  learnerId: string;
  previousLevel: string;
  newLevel: string;
  reason: string;
}
