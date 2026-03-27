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

export const INTEGRATIONS_SUBJECTS = {
  "integrations.roster.synced": "aivo.integrations.roster.synced",
  "integrations.lti.launch": "aivo.integrations.lti.launch",
} as const;

export const INTEGRATIONS_SCHEMAS = {
  "integrations.roster.synced": IntegrationsRosterSyncedSchema,
  "integrations.lti.launch": IntegrationsLtiLaunchSchema,
} as const;
