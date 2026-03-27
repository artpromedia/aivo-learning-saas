import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./identity";

// ─── Enums ──────────────────────────────────────────────────────────────────────

export const brainVersionStatusEnum = pgEnum("brain_version_status", [
  "DRAFT",
  "PUBLISHED",
  "ROLLING_OUT",
  "ACTIVE",
  "DEPRECATED",
]);

export const rolloutPhaseEnum = pgEnum("rollout_phase", [
  "PHASE_1",
  "PHASE_2",
  "PHASE_3",
  "COMPLETED",
  "ROLLED_BACK",
]);

export const rolloutStatusEnum = pgEnum("rollout_status", [
  "IN_PROGRESS",
  "MONITORING",
  "COMPLETED",
  "ROLLED_BACK",
  "PAUSED",
]);

export const leadStageEnum = pgEnum("lead_stage", [
  "NEW",
  "CONTACTED",
  "DEMO_SCHEDULED",
  "DEMO_COMPLETED",
  "PROPOSAL_SENT",
  "NEGOTIATING",
  "WON",
  "LOST",
]);

export const flagTypeEnum = pgEnum("flag_type", [
  "BOOLEAN",
  "PERCENTAGE",
  "TENANT_LIST",
]);

// ─── Brain Versions ─────────────────────────────────────────────────────────────

export const brainVersions = pgTable(
  "brain_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: varchar("version", { length: 64 }).notNull(),
    changelog: text("changelog").notNull(),
    seedTemplatesUpdated: boolean("seed_templates_updated").notNull().default(false),
    status: brainVersionStatusEnum("status").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("brain_versions_version_idx").on(t.version),
    index("brain_versions_status_idx").on(t.status),
  ],
);

// ─── Brain Rollouts ─────────────────────────────────────────────────────────────

export const brainRollouts = pgTable(
  "brain_rollouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brainVersionId: uuid("brain_version_id")
      .notNull()
      .references(() => brainVersions.id, { onDelete: "cascade" }),
    phase: rolloutPhaseEnum("phase").notNull().default("PHASE_1"),
    status: rolloutStatusEnum("status").notNull().default("IN_PROGRESS"),
    targetPercentage: integer("target_percentage").notNull().default(5),
    brainsUpgraded: integer("brains_upgraded").notNull().default(0),
    brainsTotal: integer("brains_total").notNull().default(0),
    regressionsDetected: integer("regressions_detected").notNull().default(0),
    phaseStartedAt: timestamp("phase_started_at", { withTimezone: true }).notNull().defaultNow(),
    phaseCompletedAt: timestamp("phase_completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("brain_rollouts_version_id_idx").on(t.brainVersionId),
    index("brain_rollouts_status_idx").on(t.status),
  ],
);

// ─── Feature Flags ──────────────────────────────────────────────────────────────

export const featureFlags = pgTable(
  "feature_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 255 }).notNull(),
    description: varchar("description", { length: 1024 }),
    type: flagTypeEnum("type").notNull().default("BOOLEAN"),
    defaultValue: jsonb("default_value").notNull().default(false),
    enabled: boolean("enabled").notNull().default(false),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("feature_flags_key_idx").on(t.key),
  ],
);

// ─── Feature Flag Overrides ─────────────────────────────────────────────────────

export const featureFlagOverrides = pgTable(
  "feature_flag_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    flagId: uuid("flag_id")
      .notNull()
      .references(() => featureFlags.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    value: jsonb("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("feature_flag_overrides_flag_tenant_idx").on(t.flagId, t.tenantId),
    index("feature_flag_overrides_flag_id_idx").on(t.flagId),
    index("feature_flag_overrides_tenant_id_idx").on(t.tenantId),
  ],
);

// ─── Leads ──────────────────────────────────────────────────────────────────────

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationName: varchar("organization_name", { length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }).notNull(),
    contactEmail: varchar("contact_email", { length: 320 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 64 }),
    districtSize: integer("district_size"),
    stage: leadStageEnum("stage").notNull().default("NEW"),
    source: varchar("source", { length: 128 }),
    assignedTo: uuid("assigned_to"),
    convertedTenantId: uuid("converted_tenant_id")
      .references(() => tenants.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("leads_stage_idx").on(t.stage),
    index("leads_assigned_to_idx").on(t.assignedTo),
    index("leads_contact_email_idx").on(t.contactEmail),
  ],
);

// ─── Lead Notes ─────────────────────────────────────────────────────────────────

export const leadNotes = pgTable(
  "lead_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("lead_notes_lead_id_idx").on(t.leadId),
  ],
);

// ─── Admin Audit Logs ───────────────────────────────────────────────────────────

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminUserId: uuid("admin_user_id").notNull(),
    action: varchar("action", { length: 128 }).notNull(),
    resourceType: varchar("resource_type", { length: 128 }).notNull(),
    resourceId: varchar("resource_id", { length: 255 }),
    details: jsonb("details").default({}),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_admin_user_id_idx").on(t.adminUserId),
    index("audit_logs_action_idx").on(t.action),
    index("audit_logs_resource_type_idx").on(t.resourceType),
    index("audit_logs_created_at_idx").on(t.createdAt),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────

export const brainVersionsRelations = relations(brainVersions, ({ many }) => ({
  rollouts: many(brainRollouts),
}));

export const brainRolloutsRelations = relations(brainRollouts, ({ one }) => ({
  brainVersion: one(brainVersions, { fields: [brainRollouts.brainVersionId], references: [brainVersions.id] }),
}));

export const featureFlagsRelations = relations(featureFlags, ({ many }) => ({
  overrides: many(featureFlagOverrides),
}));

export const featureFlagOverridesRelations = relations(featureFlagOverrides, ({ one }) => ({
  flag: one(featureFlags, { fields: [featureFlagOverrides.flagId], references: [featureFlags.id] }),
  tenant: one(tenants, { fields: [featureFlagOverrides.tenantId], references: [tenants.id] }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  convertedTenant: one(tenants, { fields: [leads.convertedTenantId], references: [tenants.id] }),
  notes: many(leadNotes),
}));

export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  lead: one(leads, { fields: [leadNotes.leadId], references: [leads.id] }),
}));
