import { z } from "zod";

const TutorSkuSchema = z.enum([
  "ADDON_TUTOR_MATH",
  "ADDON_TUTOR_ELA",
  "ADDON_TUTOR_SCIENCE",
  "ADDON_TUTOR_HISTORY",
  "ADDON_TUTOR_CODING",
  "ADDON_TUTOR_SEL",
  "ADDON_TUTOR_SPEECH",
  "ADDON_TUTOR_BUNDLE",
]);

// ─── tutor.addon.activated ──────────────────────────────────────────────────────
export const TutorAddonActivatedSchema = z.object({
  learnerId: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: TutorSkuSchema,
  subject: z.string(),
});
export type TutorAddonActivated = z.infer<typeof TutorAddonActivatedSchema>;

// ─── tutor.addon.deactivated ────────────────────────────────────────────────────
export const TutorAddonDeactivatedSchema = z.object({
  learnerId: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: TutorSkuSchema,
});
export type TutorAddonDeactivated = z.infer<typeof TutorAddonDeactivatedSchema>;

// ─── tutor.session.started ──────────────────────────────────────────────────────
export const TutorSessionStartedSchema = z.object({
  learnerId: z.string().uuid(),
  tutorSku: TutorSkuSchema,
  sessionId: z.string().uuid(),
});
export type TutorSessionStarted = z.infer<typeof TutorSessionStartedSchema>;

// ─── tutor.session.completed ────────────────────────────────────────────────────
export const TutorSessionCompletedSchema = z.object({
  learnerId: z.string().uuid(),
  tutorSku: TutorSkuSchema,
  sessionId: z.string().uuid(),
  masteryUpdates: z.record(z.string(), z.unknown()),
  engagementMetrics: z.record(z.string(), z.unknown()),
});
export type TutorSessionCompleted = z.infer<typeof TutorSessionCompletedSchema>;

export const TUTOR_SUBJECTS = {
  "tutor.addon.activated": "aivo.tutor.addon.activated",
  "tutor.addon.deactivated": "aivo.tutor.addon.deactivated",
  "tutor.session.started": "aivo.tutor.session.started",
  "tutor.session.completed": "aivo.tutor.session.completed",
} as const;

export const TUTOR_SCHEMAS = {
  "tutor.addon.activated": TutorAddonActivatedSchema,
  "tutor.addon.deactivated": TutorAddonDeactivatedSchema,
  "tutor.session.started": TutorSessionStartedSchema,
  "tutor.session.completed": TutorSessionCompletedSchema,
} as const;
