/** Backend API route constants */

// Auth
export const AUTH_ROUTES = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  SESSION: "/api/auth/session",
  REFRESH: "/api/auth/refresh",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
} as const;

// Users
export const USER_ROUTES = {
  ME: "/api/users/me",
  UPDATE_PROFILE: "/api/users/me",
  UPDATE_PREFERENCES: "/api/users/me/preferences",
} as const;

// Learners
export const LEARNER_ROUTES = {
  LIST: "/api/learners",
  CREATE: "/api/learners",
  DETAIL: (id: string) => `/api/learners/${id}`,
  UPDATE: (id: string) => `/api/learners/${id}`,
  PROGRESS: (id: string) => `/api/learners/${id}/progress`,
  SESSIONS: (id: string) => `/api/learners/${id}/sessions`,
} as const;

// Lessons
export const LESSON_ROUTES = {
  LIST: "/api/lessons",
  DETAIL: (id: string) => `/api/lessons/${id}`,
  START: (id: string) => `/api/lessons/${id}/start`,
  COMPLETE: (id: string) => `/api/lessons/${id}/complete`,
  SUBMIT_ANSWER: (id: string) => `/api/lessons/${id}/answer`,
} as const;

// Curriculum
export const CURRICULUM_ROUTES = {
  LIST: "/api/curriculum",
  DETAIL: (id: string) => `/api/curriculum/${id}`,
  MODULES: (id: string) => `/api/curriculum/${id}/modules`,
} as const;

// Analytics
export const ANALYTICS_ROUTES = {
  DASHBOARD: "/api/analytics/dashboard",
  LEARNER: (id: string) => `/api/analytics/learner/${id}`,
  REPORTS: "/api/analytics/reports",
} as const;

// Subscriptions / Billing
export const BILLING_ROUTES = {
  PLANS: "/api/billing/plans",
  SUBSCRIBE: "/api/billing/subscribe",
  PORTAL: "/api/billing/portal",
  CURRENT: "/api/billing/current",
} as const;

// Notifications
export const NOTIFICATION_ROUTES = {
  LIST: "/api/notifications",
  MARK_READ: (id: string) => `/api/notifications/${id}/read`,
  MARK_ALL_READ: "/api/notifications/read-all",
} as const;

// Brain Profile
export const BRAIN_ROUTES = {
  PROFILE: (learnerId: string) => `/api/learners/${learnerId}/brain-profile`,
  SEED: (learnerId: string) => `/api/learners/${learnerId}/brain-profile/seed`,
  APPROVE: (learnerId: string) => `/api/learners/${learnerId}/brain-profile/approve`,
  DECLINE: (learnerId: string) => `/api/learners/${learnerId}/brain-profile/decline`,
  ADD_INSIGHTS: (learnerId: string) => `/api/learners/${learnerId}/brain-profile/insights`,
} as const;

// Recommendations
export const RECOMMENDATION_ROUTES = {
  LIST: (learnerId: string) => `/api/learners/${learnerId}/recommendations`,
  APPROVE: (learnerId: string, recId: string) => `/api/learners/${learnerId}/recommendations/${recId}/approve`,
  DECLINE: (learnerId: string, recId: string) => `/api/learners/${learnerId}/recommendations/${recId}/decline`,
  ADJUST: (learnerId: string, recId: string) => `/api/learners/${learnerId}/recommendations/${recId}/adjust`,
} as const;

// Learning Sessions
export const SESSION_ROUTES = {
  START: "/api/sessions/start",
  INTERACT: (sessionId: string) => `/api/sessions/${sessionId}/interact`,
  COMPLETE: (sessionId: string) => `/api/sessions/${sessionId}/complete`,
} as const;

// Tutor Chat
export const TUTOR_ROUTES = {
  CHAT_SSE: (sessionId: string) => `/api/tutors/${sessionId}/chat`,
  LIST: "/api/tutors",
  STORE: "/api/tutors/store",
} as const;

// Engagement (XP, streaks, badges, etc.)
export const ENGAGEMENT_ROUTES = {
  SUMMARY: (learnerId: string) => `/api/learners/${learnerId}/engagement`,
  XP: (learnerId: string) => `/api/learners/${learnerId}/engagement/xp`,
  STREAKS: (learnerId: string) => `/api/learners/${learnerId}/engagement/streaks`,
  BADGES: (learnerId: string) => `/api/learners/${learnerId}/engagement/badges`,
  LEVEL: (learnerId: string) => `/api/learners/${learnerId}/engagement/level`,
} as const;

// Functioning Level
export const FUNCTIONING_LEVEL_ROUTES = {
  CURRENT: (learnerId: string) => `/api/learners/${learnerId}/functioning-level`,
} as const;

// Onboarding (assessment-svc)
export const ONBOARDING_ROUTES = {
  PARENT_ASSESSMENT: "/assessment/parent",
  IEP_UPLOAD: "/assessment/iep/upload",
  IEP_STATUS: (uploadId: string) => `/assessment/iep/${uploadId}/status`,
  IEP_CONFIRM: (uploadId: string) => `/assessment/iep/${uploadId}/confirm`,
  BASELINE_START: (learnerId: string) => `/assessment/baseline/${learnerId}/start`,
  BASELINE_ANSWER: (learnerId: string) => `/assessment/baseline/${learnerId}/answer`,
  BASELINE_COMPLETE: (learnerId: string) => `/assessment/baseline/${learnerId}/complete`,
  BASELINE_STATUS: (learnerId: string) => `/assessment/baseline/${learnerId}/status`,
  COMPLETE: "/api/onboarding/complete",
} as const;

// Gradebook
export const GRADEBOOK_ROUTES = {
  SUMMARY: (learnerId: string) => `/api/learners/${learnerId}/gradebook`,
  MASTERY: (learnerId: string) => `/api/learners/${learnerId}/gradebook/mastery`,
} as const;

// Quests
export const QUEST_ROUTES = {
  WORLDS: (learnerId: string) => `/api/learners/${learnerId}/quests/worlds`,
  DETAIL: (learnerId: string, questId: string) => `/api/learners/${learnerId}/quests/${questId}`,
} as const;

// Avatar Shop
export const SHOP_ROUTES = {
  ITEMS: "/api/shop/items",
  PURCHASE: "/api/shop/purchase",
  EQUIPPED: (learnerId: string) => `/api/learners/${learnerId}/avatar`,
} as const;

// Combined API_ROUTES re-export
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  USER: USER_ROUTES,
  LEARNER: LEARNER_ROUTES,
  LESSON: LESSON_ROUTES,
  CURRICULUM: CURRICULUM_ROUTES,
  ANALYTICS: ANALYTICS_ROUTES,
  BILLING: BILLING_ROUTES,
  NOTIFICATION: NOTIFICATION_ROUTES,
  BRAIN: BRAIN_ROUTES,
  RECOMMENDATION: RECOMMENDATION_ROUTES,
  SESSION: SESSION_ROUTES,
  TUTOR: TUTOR_ROUTES,
  ENGAGEMENT: ENGAGEMENT_ROUTES,
  FUNCTIONING_LEVEL: FUNCTIONING_LEVEL_ROUTES,
  ONBOARDING: ONBOARDING_ROUTES,
  GRADEBOOK: GRADEBOOK_ROUTES,
  QUEST: QUEST_ROUTES,
  SHOP: SHOP_ROUTES,
} as const;
