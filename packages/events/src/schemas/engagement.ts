import { z } from "zod";

// ─── engagement.xp.earned ───────────────────────────────────────────────────────
export const EngagementXpEarnedSchema = z.object({
  learnerId: z.string().uuid(),
  xpAmount: z.number().int().positive(),
  activity: z.string(),
  triggerEvent: z.string(),
});
export type EngagementXpEarned = z.infer<typeof EngagementXpEarnedSchema>;

// ─── engagement.level.up ────────────────────────────────────────────────────────
export const EngagementLevelUpSchema = z.object({
  learnerId: z.string().uuid(),
  newLevel: z.number().int().positive(),
  totalXp: z.number().int().nonnegative(),
});
export type EngagementLevelUp = z.infer<typeof EngagementLevelUpSchema>;

// ─── engagement.badge.earned ────────────────────────────────────────────────────
export const EngagementBadgeEarnedSchema = z.object({
  learnerId: z.string().uuid(),
  badgeSlug: z.string(),
});
export type EngagementBadgeEarned = z.infer<typeof EngagementBadgeEarnedSchema>;

// ─── engagement.streak.extended ─────────────────────────────────────────────────
export const EngagementStreakExtendedSchema = z.object({
  learnerId: z.string().uuid(),
  currentStreak: z.number().int().positive(),
});
export type EngagementStreakExtended = z.infer<typeof EngagementStreakExtendedSchema>;

// ─── engagement.streak.broken ───────────────────────────────────────────────────
export const EngagementStreakBrokenSchema = z.object({
  learnerId: z.string().uuid(),
  previousStreak: z.number().int().nonnegative(),
});
export type EngagementStreakBroken = z.infer<typeof EngagementStreakBrokenSchema>;

// ─── engagement.challenge.completed ─────────────────────────────────────────────
export const EngagementChallengeCompletedSchema = z.object({
  learnerId: z.string().uuid(),
  challengeId: z.string().uuid(),
  won: z.boolean(),
});
export type EngagementChallengeCompleted = z.infer<typeof EngagementChallengeCompletedSchema>;

// ─── engagement.shop.purchased ──────────────────────────────────────────────────
export const EngagementShopPurchasedSchema = z.object({
  learnerId: z.string().uuid(),
  itemId: z.string(),
  cost: z.number().int().nonnegative(),
});
export type EngagementShopPurchased = z.infer<typeof EngagementShopPurchasedSchema>;

// ─── focus.session_30min ────────────────────────────────────────────────────────
export const FocusSession30minSchema = z.object({
  learnerId: z.string().uuid(),
  sessionId: z.string().uuid(),
});
export type FocusSession30min = z.infer<typeof FocusSession30minSchema>;

// ─── focus.session_90min ────────────────────────────────────────────────────────
export const FocusSession90minSchema = z.object({
  learnerId: z.string().uuid(),
  sessionId: z.string().uuid(),
});
export type FocusSession90min = z.infer<typeof FocusSession90minSchema>;

// ─── break.completed ────────────────────────────────────────────────────────────
export const BreakCompletedSchema = z.object({
  learnerId: z.string().uuid(),
});
export type BreakCompleted = z.infer<typeof BreakCompletedSchema>;

export const ENGAGEMENT_SUBJECTS = {
  "engagement.xp.earned": "aivo.engagement.xp.earned",
  "engagement.level.up": "aivo.engagement.level.up",
  "engagement.badge.earned": "aivo.engagement.badge.earned",
  "engagement.streak.extended": "aivo.engagement.streak.extended",
  "engagement.streak.broken": "aivo.engagement.streak.broken",
  "engagement.challenge.completed": "aivo.engagement.challenge.completed",
  "engagement.shop.purchased": "aivo.engagement.shop.purchased",
  "focus.session_30min": "aivo.focus.session_30min",
  "focus.session_90min": "aivo.focus.session_90min",
  "break.completed": "aivo.break.completed",
} as const;

export const ENGAGEMENT_SCHEMAS = {
  "engagement.xp.earned": EngagementXpEarnedSchema,
  "engagement.level.up": EngagementLevelUpSchema,
  "engagement.badge.earned": EngagementBadgeEarnedSchema,
  "engagement.streak.extended": EngagementStreakExtendedSchema,
  "engagement.streak.broken": EngagementStreakBrokenSchema,
  "engagement.challenge.completed": EngagementChallengeCompletedSchema,
  "engagement.shop.purchased": EngagementShopPurchasedSchema,
  "focus.session_30min": FocusSession30minSchema,
  "focus.session_90min": FocusSession90minSchema,
  "break.completed": BreakCompletedSchema,
} as const;
