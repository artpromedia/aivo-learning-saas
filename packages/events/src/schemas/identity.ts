import { z } from "zod";

// ─── identity.user.created ──────────────────────────────────────────────────────
export const IdentityUserCreatedSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: z.enum([
    "PARENT",
    "TEACHER",
    "CAREGIVER",
    "LEARNER",
    "DISTRICT_ADMIN",
    "PLATFORM_ADMIN",
  ]),
  email: z.string().email(),
});
export type IdentityUserCreated = z.infer<typeof IdentityUserCreatedSchema>;

// ─── identity.user.invited ──────────────────────────────────────────────────────
export const IdentityUserInvitedSchema = z.object({
  userId: z.string().uuid(),
  invitedBy: z.string().uuid(),
  role: z.enum([
    "PARENT",
    "TEACHER",
    "CAREGIVER",
    "LEARNER",
    "DISTRICT_ADMIN",
    "PLATFORM_ADMIN",
  ]),
});
export type IdentityUserInvited = z.infer<typeof IdentityUserInvitedSchema>;

// ─── identity.learner.created ───────────────────────────────────────────────────
export const IdentityLearnerCreatedSchema = z.object({
  learnerId: z.string().uuid(),
  tenantId: z.string().uuid(),
  parentId: z.string().uuid(),
});
export type IdentityLearnerCreated = z.infer<typeof IdentityLearnerCreatedSchema>;

export const IDENTITY_SUBJECTS = {
  "identity.user.created": "aivo.identity.user.created",
  "identity.user.invited": "aivo.identity.user.invited",
  "identity.learner.created": "aivo.identity.learner.created",
} as const;

export const IDENTITY_SCHEMAS = {
  "identity.user.created": IdentityUserCreatedSchema,
  "identity.user.invited": IdentityUserInvitedSchema,
  "identity.learner.created": IdentityLearnerCreatedSchema,
} as const;
