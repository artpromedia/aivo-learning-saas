import { z } from "zod";

// ─── admin.tenant.created ───────────────────────────────────────────────────────
export const AdminTenantCreatedSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string(),
  type: z.enum(["B2C_FAMILY", "B2B_DISTRICT"]),
  createdBy: z.string().uuid(),
});
export type AdminTenantCreated = z.infer<typeof AdminTenantCreatedSchema>;

// ─── admin.tenant.suspended ─────────────────────────────────────────────────────
export const AdminTenantSuspendedSchema = z.object({
  tenantId: z.string().uuid(),
  suspendedBy: z.string().uuid(),
  reason: z.string().optional(),
});
export type AdminTenantSuspended = z.infer<typeof AdminTenantSuspendedSchema>;

// ─── brain.version.rollout.started ──────────────────────────────────────────────
export const BrainVersionRolloutStartedSchema = z.object({
  brainVersionId: z.string().uuid(),
  version: z.string(),
  phase: z.enum(["PHASE_1", "PHASE_2", "PHASE_3"]),
  targetPercentage: z.number().min(0).max(100),
});
export type BrainVersionRolloutStarted = z.infer<typeof BrainVersionRolloutStartedSchema>;

// ─── brain.version.rollback ────────────────────────────────────────────────────
export const BrainVersionRollbackSchema = z.object({
  brainVersionId: z.string().uuid(),
  version: z.string(),
  reason: z.string().optional(),
  initiatedBy: z.string().uuid(),
});
export type BrainVersionRollback = z.infer<typeof BrainVersionRollbackSchema>;

export const ADMIN_SUBJECTS = {
  "admin.tenant.created": "aivo.admin.tenant.created",
  "admin.tenant.suspended": "aivo.admin.tenant.suspended",
  "brain.version.rollout.started": "aivo.brain.version.rollout.started",
  "brain.version.rollback": "aivo.brain.version.rollback",
} as const;

export const ADMIN_SCHEMAS = {
  "admin.tenant.created": AdminTenantCreatedSchema,
  "admin.tenant.suspended": AdminTenantSuspendedSchema,
  "brain.version.rollout.started": BrainVersionRolloutStartedSchema,
  "brain.version.rollback": BrainVersionRollbackSchema,
} as const;
