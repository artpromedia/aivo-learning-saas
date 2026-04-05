import { z } from "zod";

// ─── integrations.roster.synced ─────────────────────────────────────────────────
export const IntegrationsRosterSyncedSchema = z.object({
  tenantId: z.string().uuid(),
  provider: z.enum(["CLEVER", "CLASSLINK", "ONEROSTER", "CSV"]),
  studentsAdded: z.number().int(),
  studentsUpdated: z.number().int(),
  studentsDeleted: z.number().int(),
  teachersAdded: z.number().int(),
});
export type IntegrationsRosterSynced = z.infer<typeof IntegrationsRosterSyncedSchema>;

// ─── integrations.lti.launch ────────────────────────────────────────────────────
export const IntegrationsLtiLaunchSchema = z.object({
  tenantId: z.string().uuid(),
  learnerId: z.string().uuid(),
  platformId: z.string(),
  resourceLinkId: z.string(),
  subject: z.string().optional(),
});
export type IntegrationsLtiLaunch = z.infer<typeof IntegrationsLtiLaunchSchema>;

// ─── integrations.iep.teacher_uploaded ──────────────────────────────────────────
export const IntegrationsIepTeacherUploadedSchema = z.object({
  learnerId: z.string().uuid(),
  tenantId: z.string().uuid(),
  teacherId: z.string().uuid(),
  uploadId: z.string().uuid(),
  fileName: z.string(),
});
export type IntegrationsIepTeacherUploaded = z.infer<typeof IntegrationsIepTeacherUploadedSchema>;

export const INTEGRATIONS_SUBJECTS = {
  "integrations.roster.synced": "aivo.integrations.roster.synced",
  "integrations.lti.launch": "aivo.integrations.lti.launch",
  "integrations.iep.teacher_uploaded": "aivo.integrations.iep.teacher_uploaded",
} as const;

export const INTEGRATIONS_SCHEMAS = {
  "integrations.roster.synced": IntegrationsRosterSyncedSchema,
  "integrations.lti.launch": IntegrationsLtiLaunchSchema,
  "integrations.iep.teacher_uploaded": IntegrationsIepTeacherUploadedSchema,
} as const;
