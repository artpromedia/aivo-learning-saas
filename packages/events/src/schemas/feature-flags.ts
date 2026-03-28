import { z } from "zod";

// ─── featureflag.changed ──────────────────────────────────────────────────────
export const FeatureFlagChangedSchema = z.object({
  key: z.string(),
  type: z.enum(["BOOLEAN", "PERCENTAGE", "TENANT_LIST"]),
  enabled: z.boolean(),
  defaultValue: z.unknown(),
  overrideTenantId: z.string().uuid().optional(),
  changedBy: z.string().uuid(),
  changedAt: z.string().datetime(),
});
export type FeatureFlagChanged = z.infer<typeof FeatureFlagChangedSchema>;

export const FEATURE_FLAG_SUBJECTS = {
  "featureflag.changed": "aivo.featureflag.changed",
} as const;

export const FEATURE_FLAG_SCHEMAS = {
  "featureflag.changed": FeatureFlagChangedSchema,
} as const;
