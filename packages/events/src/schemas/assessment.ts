import { z } from "zod";

// ─── assessment.parent.completed ────────────────────────────────────────────────
export const AssessmentParentCompletedSchema = z.object({
  learnerId: z.string().uuid(),
  parentId: z.string().uuid(),
  responses: z.record(z.string(), z.unknown()),
  functioningLevelSignals: z.record(z.string(), z.unknown()),
});
export type AssessmentParentCompleted = z.infer<typeof AssessmentParentCompletedSchema>;

// ─── assessment.iep.uploaded ────────────────────────────────────────────────────
export const AssessmentIepUploadedSchema = z.object({
  learnerId: z.string().uuid(),
  documentId: z.string().uuid(),
  fileUrl: z.string().url(),
});
export type AssessmentIepUploaded = z.infer<typeof AssessmentIepUploadedSchema>;

// ─── assessment.iep.parsed ──────────────────────────────────────────────────────
export const AssessmentIepParsedSchema = z.object({
  learnerId: z.string().uuid(),
  documentId: z.string().uuid(),
  parsedData: z.record(z.string(), z.unknown()),
});
export type AssessmentIepParsed = z.infer<typeof AssessmentIepParsedSchema>;

// ─── assessment.iep.confirmed ───────────────────────────────────────────────────
export const AssessmentIepConfirmedSchema = z.object({
  learnerId: z.string().uuid(),
  documentId: z.string().uuid(),
  confirmedBy: z.string().uuid(),
});
export type AssessmentIepConfirmed = z.infer<typeof AssessmentIepConfirmedSchema>;

// ─── assessment.baseline.started ────────────────────────────────────────────────
export const AssessmentBaselineStartedSchema = z.object({
  learnerId: z.string().uuid(),
  assessmentMode: z.enum([
    "STANDARD",
    "MODIFIED",
    "PICTURE_BASED",
    "SWITCH_SCAN",
    "EYE_GAZE",
    "PARTNER_ASSISTED",
    "OBSERVATIONAL",
  ]),
});
export type AssessmentBaselineStarted = z.infer<typeof AssessmentBaselineStartedSchema>;

// ─── assessment.baseline.completed ──────────────────────────────────────────────
export const AssessmentBaselineCompletedSchema = z.object({
  learnerId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  domains: z.record(z.string(), z.number().min(0).max(1)),
  functioningLevel: z.enum([
    "STANDARD",
    "SUPPORTED",
    "LOW_VERBAL",
    "NON_VERBAL",
    "PRE_SYMBOLIC",
  ]),
  iepProfile: z.record(z.string(), z.unknown()).optional(),
});
export type AssessmentBaselineCompleted = z.infer<typeof AssessmentBaselineCompletedSchema>;

export const ASSESSMENT_SUBJECTS = {
  "assessment.parent.completed": "aivo.assessment.parent.completed",
  "assessment.iep.uploaded": "aivo.assessment.iep.uploaded",
  "assessment.iep.parsed": "aivo.assessment.iep.parsed",
  "assessment.iep.confirmed": "aivo.assessment.iep.confirmed",
  "assessment.baseline.started": "aivo.assessment.baseline.started",
  "assessment.baseline.completed": "aivo.assessment.baseline.completed",
} as const;

export const ASSESSMENT_SCHEMAS = {
  "assessment.parent.completed": AssessmentParentCompletedSchema,
  "assessment.iep.uploaded": AssessmentIepUploadedSchema,
  "assessment.iep.parsed": AssessmentIepParsedSchema,
  "assessment.iep.confirmed": AssessmentIepConfirmedSchema,
  "assessment.baseline.started": AssessmentBaselineStartedSchema,
  "assessment.baseline.completed": AssessmentBaselineCompletedSchema,
} as const;
