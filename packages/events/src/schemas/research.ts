import { z } from "zod";

// ─── research.export.requested ──────────────────────────────────────────────────
export const ResearchExportRequestedSchema = z.object({
  exportId: z.string().uuid(),
  cohortId: z.string().uuid(),
  format: z.enum(["CSV", "JSON", "PARQUET"]),
  kLevel: z.number().int().min(1),
  epsilon: z.number().positive(),
  requestedBy: z.string().uuid(),
});
export type ResearchExportRequested = z.infer<typeof ResearchExportRequestedSchema>;

// ─── research.export.completed ──────────────────────────────────────────────────
export const ResearchExportCompletedSchema = z.object({
  exportId: z.string().uuid(),
  cohortId: z.string().uuid(),
  fileUrl: z.string(),
  rowCount: z.number().int().min(0),
});
export type ResearchExportCompleted = z.infer<typeof ResearchExportCompletedSchema>;

// ─── research.snapshot.generated ────────────────────────────────────────────────
export const ResearchSnapshotGeneratedSchema = z.object({
  cohortId: z.string().uuid(),
  snapshotDate: z.string(),
  kAnonymityLevel: z.number().int().min(1),
});
export type ResearchSnapshotGenerated = z.infer<typeof ResearchSnapshotGeneratedSchema>;

// ─── research.model.contribution ────────────────────────────────────────────────
export const ResearchModelContributionSchema = z.object({
  modelVersion: z.string(),
  tenantId: z.string().uuid(),
  sampleCount: z.number().int().min(0),
});
export type ResearchModelContribution = z.infer<typeof ResearchModelContributionSchema>;

// ─── research.study.created ─────────────────────────────────────────────────────
export const ResearchStudyCreatedSchema = z.object({
  studyId: z.string().uuid(),
  name: z.string(),
  controlCohortId: z.string().uuid(),
  treatmentCohortId: z.string().uuid(),
  metric: z.string(),
});
export type ResearchStudyCreated = z.infer<typeof ResearchStudyCreatedSchema>;

export const RESEARCH_SUBJECTS = {
  "research.export.requested": "aivo.research.export.requested",
  "research.export.completed": "aivo.research.export.completed",
  "research.snapshot.generated": "aivo.research.snapshot.generated",
  "research.model.contribution": "aivo.research.model.contribution",
  "research.study.created": "aivo.research.study.created",
} as const;

export const RESEARCH_SCHEMAS = {
  "research.export.requested": ResearchExportRequestedSchema,
  "research.export.completed": ResearchExportCompletedSchema,
  "research.snapshot.generated": ResearchSnapshotGeneratedSchema,
  "research.model.contribution": ResearchModelContributionSchema,
  "research.study.created": ResearchStudyCreatedSchema,
} as const;
