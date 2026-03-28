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
  date,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./identity";

// ─── Enums ──────────────────────────────────────────────────────────────────────

export const researchExportFormatEnum = pgEnum("research_export_format", [
  "CSV",
  "JSON",
  "PARQUET",
]);

export const researchExportStatusEnum = pgEnum("research_export_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const interventionStudyStatusEnum = pgEnum("intervention_study_status", [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
]);

// ─── Research Cohorts ───────────────────────────────────────────────────────────

export const researchCohorts = pgTable(
  "research_cohorts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    filters: jsonb("filters").notNull().default({}),
    learnerCount: integer("learner_count").notNull().default(0),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("research_cohorts_created_by_idx").on(t.createdBy),
    index("research_cohorts_created_at_idx").on(t.createdAt),
  ],
);

// ─── Anonymized Snapshots ───────────────────────────────────────────────────────

export const anonymizedSnapshots = pgTable(
  "anonymized_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cohortId: uuid("cohort_id")
      .notNull()
      .references(() => researchCohorts.id, { onDelete: "cascade" }),
    snapshotDate: date("snapshot_date").notNull(),
    aggregateData: jsonb("aggregate_data").notNull().default({}),
    kAnonymityLevel: integer("k_anonymity_level").notNull().default(10),
    noiseEpsilon: real("noise_epsilon").notNull().default(1.0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("anonymized_snapshots_cohort_id_idx").on(t.cohortId),
    index("anonymized_snapshots_snapshot_date_idx").on(t.snapshotDate),
  ],
);

// ─── Research Exports ───────────────────────────────────────────────────────────

export const researchExports = pgTable(
  "research_exports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cohortId: uuid("cohort_id")
      .notNull()
      .references(() => researchCohorts.id, { onDelete: "cascade" }),
    format: researchExportFormatEnum("format").notNull(),
    rowCount: integer("row_count"),
    fileUrl: varchar("file_url", { length: 1024 }),
    anonymizationMethod: varchar("anonymization_method", { length: 128 }),
    kLevel: integer("k_level").notNull().default(10),
    epsilon: real("epsilon").notNull().default(1.0),
    requestedBy: uuid("requested_by").notNull(),
    status: researchExportStatusEnum("status").notNull().default("PENDING"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("research_exports_cohort_id_idx").on(t.cohortId),
    index("research_exports_status_idx").on(t.status),
    index("research_exports_requested_by_idx").on(t.requestedBy),
  ],
);

// ─── Intervention Studies ───────────────────────────────────────────────────────

export const interventionStudies = pgTable(
  "intervention_studies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    hypothesis: text("hypothesis"),
    controlCohortId: uuid("control_cohort_id")
      .notNull()
      .references(() => researchCohorts.id, { onDelete: "cascade" }),
    treatmentCohortId: uuid("treatment_cohort_id")
      .notNull()
      .references(() => researchCohorts.id, { onDelete: "cascade" }),
    metric: varchar("metric", { length: 255 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    status: interventionStudyStatusEnum("status").notNull().default("DRAFT"),
    results: jsonb("results"),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("intervention_studies_status_idx").on(t.status),
    index("intervention_studies_control_cohort_idx").on(t.controlCohortId),
    index("intervention_studies_treatment_cohort_idx").on(t.treatmentCohortId),
    index("intervention_studies_created_by_idx").on(t.createdBy),
  ],
);

// ─── Federated Model Updates ────────────────────────────────────────────────────

export const federatedModelUpdates = pgTable(
  "federated_model_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    modelVersion: varchar("model_version", { length: 128 }).notNull(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "set null" }),
    gradientAggregate: jsonb("gradient_aggregate").notNull().default({}),
    sampleCount: integer("sample_count").notNull().default(0),
    contributedAt: timestamp("contributed_at", { withTimezone: true }).notNull().defaultNow(),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
  },
  (t) => [
    index("federated_model_updates_model_version_idx").on(t.modelVersion),
    index("federated_model_updates_tenant_id_idx").on(t.tenantId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────

export const researchCohortsRelations = relations(researchCohorts, ({ many }) => ({
  snapshots: many(anonymizedSnapshots),
  exports: many(researchExports),
  controlStudies: many(interventionStudies, { relationName: "controlCohort" }),
  treatmentStudies: many(interventionStudies, { relationName: "treatmentCohort" }),
}));

export const anonymizedSnapshotsRelations = relations(anonymizedSnapshots, ({ one }) => ({
  cohort: one(researchCohorts, { fields: [anonymizedSnapshots.cohortId], references: [researchCohorts.id] }),
}));

export const researchExportsRelations = relations(researchExports, ({ one }) => ({
  cohort: one(researchCohorts, { fields: [researchExports.cohortId], references: [researchCohorts.id] }),
}));

export const interventionStudiesRelations = relations(interventionStudies, ({ one }) => ({
  controlCohort: one(researchCohorts, { fields: [interventionStudies.controlCohortId], references: [researchCohorts.id], relationName: "controlCohort" }),
  treatmentCohort: one(researchCohorts, { fields: [interventionStudies.treatmentCohortId], references: [researchCohorts.id], relationName: "treatmentCohort" }),
}));

export const federatedModelUpdatesRelations = relations(federatedModelUpdates, ({ one }) => ({
  tenant: one(tenants, { fields: [federatedModelUpdates.tenantId], references: [tenants.id] }),
}));
