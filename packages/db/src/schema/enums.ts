import { pgEnum } from "drizzle-orm/pg-core";

// Identity & Tenancy
export const tenantTypeEnum = pgEnum("tenant_type", [
  "B2C_FAMILY",
  "B2B_DISTRICT",
]);

export const tenantStatusEnum = pgEnum("tenant_status", [
  "ACTIVE",
  "SUSPENDED",
  "CANCELLED",
]);

export const userRoleEnum = pgEnum("user_role", [
  "PARENT",
  "TEACHER",
  "CAREGIVER",
  "LEARNER",
  "DISTRICT_ADMIN",
  "PLATFORM_ADMIN",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "INVITED",
  "SUSPENDED",
]);

// Learner Profiles
export const functioningLevelEnum = pgEnum("functioning_level", [
  "STANDARD",
  "SUPPORTED",
  "LOW_VERBAL",
  "NON_VERBAL",
  "PRE_SYMBOLIC",
]);

export const communicationModeEnum = pgEnum("communication_mode", [
  "VERBAL",
  "LIMITED_VERBAL",
  "NON_VERBAL_AAC",
  "NON_VERBAL_PARTNER",
  "PRE_INTENTIONAL",
]);

// Brain
export const cognitiveLoadEnum = pgEnum("cognitive_load", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const snapshotTriggerEnum = pgEnum("snapshot_trigger", [
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
]);

// IEP
export const iepParseStatusEnum = pgEnum("iep_parse_status", [
  "PENDING",
  "PARSING",
  "PARSED",
  "CONFIRMED",
  "FAILED",
]);

export const iepGoalStatusEnum = pgEnum("iep_goal_status", [
  "ACTIVE",
  "MET",
  "DEFERRED",
]);

// Assessment
export const assessmentModeEnum = pgEnum("assessment_mode", [
  "STANDARD",
  "MODIFIED",
  "PICTURE_BASED",
  "SWITCH_SCAN",
  "EYE_GAZE",
  "PARTNER_ASSISTED",
  "OBSERVATIONAL",
]);

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED",
]);

// Recommendations
export const recommendationTypeEnum = pgEnum("recommendation_type", [
  "CURRICULUM_ADJUSTMENT",
  "ACCOMMODATION_CHANGE",
  "FUNCTIONING_LEVEL_CHANGE",
  "TUTOR_ADDON",
  "IEP_GOAL_UPDATE",
  "ENGAGEMENT_BOOST",
  "PARENT_MEDIATED_ACTIVITY",
  "ASSESSMENT_REBASELINE",
  "DIFFICULTY_ADJUSTMENT",
  "MODALITY_SWITCH",
  "BREAK_SUGGESTION",
  "CELEBRATION",
  "REGRESSION_ALERT",
]);

export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "PENDING",
  "APPROVED",
  "DECLINED",
  "ADJUSTED",
]);

// Tutor
export const tutorSkuEnum = pgEnum("tutor_sku", [
  "ADDON_TUTOR_MATH",
  "ADDON_TUTOR_ELA",
  "ADDON_TUTOR_SCIENCE",
  "ADDON_TUTOR_HISTORY",
  "ADDON_TUTOR_CODING",
  "ADDON_TUTOR_BUNDLE",
]);

export const tutorSubscriptionStatusEnum = pgEnum("tutor_subscription_status", [
  "ACTIVE",
  "GRACE_PERIOD",
  "CANCELLED",
  "EXPIRED",
]);

export const tutorSessionTypeEnum = pgEnum("tutor_session_type", [
  "LESSON",
  "REVIEW",
  "PRACTICE",
]);

// Homework
export const homeworkModeEnum = pgEnum("homework_mode", [
  "PRACTICE",
  "MODIFIED",
  "PARENT_MEDIATED",
  "PARENT_GUIDE",
]);

export const homeworkStatusEnum = pgEnum("homework_status", [
  "PROCESSING",
  "READY",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
]);

// Learning
export const learningSessionTypeEnum = pgEnum("learning_session_type", [
  "LESSON",
  "QUIZ",
  "READING",
  "WRITING",
  "TUTOR",
  "HOMEWORK",
]);

// Billing
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "GRACE_PERIOD",
]);

// Engagement
export const questStatusEnum = pgEnum("quest_status", [
  "ACTIVE",
  "COMPLETED",
  "ABANDONED",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "NOT_STARTED",
  "EMERGING",
  "DEVELOPING",
  "ACHIEVED",
]);

export const functionalDomainEnum = pgEnum("functional_domain", [
  "COMMUNICATION",
  "SELF_CARE",
  "SOCIAL_EMOTIONAL",
  "PRE_ACADEMIC",
  "MOTOR_SENSORY",
]);
