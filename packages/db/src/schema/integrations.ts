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

export const sisProviderEnum = pgEnum("sis_provider", [
  "CLEVER",
  "CLASSLINK",
  "ONEROSTER",
  "CSV",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
]);

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "PENDING",
  "DELIVERED",
  "FAILED",
  "RETRYING",
]);

export const csvImportStatusEnum = pgEnum("csv_import_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

// ─── SIS Connections ────────────────────────────────────────────────────────────

export const sisConnections = pgTable(
  "sis_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    provider: sisProviderEnum("provider").notNull(),
    externalDistrictId: varchar("external_district_id", { length: 255 }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    baseUrl: varchar("base_url", { length: 2048 }),
    clientId: varchar("client_id", { length: 255 }),
    clientSecret: text("client_secret"),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    lastSyncStatus: syncStatusEnum("last_sync_status"),
    config: jsonb("config").default({}),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("sis_connections_tenant_id_idx").on(t.tenantId),
    uniqueIndex("sis_connections_tenant_provider_idx").on(t.tenantId, t.provider),
  ],
);

// ─── Sync Logs ──────────────────────────────────────────────────────────────────

export const syncLogs = pgTable(
  "sync_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sisConnectionId: uuid("sis_connection_id")
      .notNull()
      .references(() => sisConnections.id, { onDelete: "cascade" }),
    status: syncStatusEnum("status").notNull().default("PENDING"),
    syncType: varchar("sync_type", { length: 64 }).notNull(),
    studentsAdded: integer("students_added").notNull().default(0),
    studentsUpdated: integer("students_updated").notNull().default(0),
    studentsDeleted: integer("students_deleted").notNull().default(0),
    teachersAdded: integer("teachers_added").notNull().default(0),
    teachersUpdated: integer("teachers_updated").notNull().default(0),
    sectionsAdded: integer("sections_added").notNull().default(0),
    errors: jsonb("errors").default([]),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("sync_logs_connection_id_idx").on(t.sisConnectionId),
    index("sync_logs_status_idx").on(t.status),
  ],
);

// ─── LTI Platforms ──────────────────────────────────────────────────────────────

export const ltiPlatforms = pgTable(
  "lti_platforms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    platformId: varchar("platform_id", { length: 512 }).notNull(),
    clientId: varchar("client_id", { length: 255 }).notNull(),
    deploymentId: varchar("deployment_id", { length: 255 }),
    authLoginUrl: varchar("auth_login_url", { length: 2048 }).notNull(),
    authTokenUrl: varchar("auth_token_url", { length: 2048 }).notNull(),
    jwksUrl: varchar("jwks_url", { length: 2048 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("lti_platforms_tenant_id_idx").on(t.tenantId),
    uniqueIndex("lti_platforms_client_id_idx").on(t.clientId),
  ],
);

// ─── Webhook Endpoints ──────────────────────────────────────────────────────────

export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 2048 }).notNull(),
    secret: varchar("secret", { length: 512 }).notNull(),
    eventTypes: jsonb("event_types").notNull().default([]),
    enabled: boolean("enabled").notNull().default(true),
    description: varchar("description", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("webhook_endpoints_tenant_id_idx").on(t.tenantId),
  ],
);

// ─── Webhook Deliveries ─────────────────────────────────────────────────────────

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    webhookEndpointId: uuid("webhook_endpoint_id")
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    payload: jsonb("payload").notNull(),
    status: webhookDeliveryStatusEnum("status").notNull().default("PENDING"),
    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("webhook_deliveries_endpoint_id_idx").on(t.webhookEndpointId),
    index("webhook_deliveries_status_idx").on(t.status),
    index("webhook_deliveries_next_retry_idx").on(t.nextRetryAt),
  ],
);

// ─── CSV Import Jobs ────────────────────────────────────────────────────────────

export const csvImportJobs = pgTable(
  "csv_import_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 512 }).notNull(),
    fileUrl: varchar("file_url", { length: 2048 }),
    status: csvImportStatusEnum("status").notNull().default("PENDING"),
    totalRows: integer("total_rows").notNull().default(0),
    processedRows: integer("processed_rows").notNull().default(0),
    successRows: integer("success_rows").notNull().default(0),
    errorRows: integer("error_rows").notNull().default(0),
    errors: jsonb("errors").default([]),
    uploadedBy: uuid("uploaded_by").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("csv_import_jobs_tenant_id_idx").on(t.tenantId),
    index("csv_import_jobs_status_idx").on(t.status),
  ],
);

// ─── Sync Log Details ──────────────────────────────────────────────────────────

export const syncLogDetails = pgTable(
  "sync_log_details",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    syncLogId: uuid("sync_log_id")
      .notNull()
      .references(() => syncLogs.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: uuid("entity_id"),
    sisId: varchar("sis_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 32 }).notNull(),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("sync_log_details_sync_log_id_idx").on(t.syncLogId),
    index("sync_log_details_entity_type_idx").on(t.entityType),
    index("sync_log_details_sis_id_idx").on(t.sisId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────

export const sisConnectionsRelations = relations(sisConnections, ({ one, many }) => ({
  tenant: one(tenants, { fields: [sisConnections.tenantId], references: [tenants.id] }),
  syncLogs: many(syncLogs),
}));

export const syncLogsRelations = relations(syncLogs, ({ one, many }) => ({
  sisConnection: one(sisConnections, { fields: [syncLogs.sisConnectionId], references: [sisConnections.id] }),
  details: many(syncLogDetails),
}));

export const syncLogDetailsRelations = relations(syncLogDetails, ({ one }) => ({
  syncLog: one(syncLogs, { fields: [syncLogDetails.syncLogId], references: [syncLogs.id] }),
}));

export const ltiPlatformsRelations = relations(ltiPlatforms, ({ one }) => ({
  tenant: one(tenants, { fields: [ltiPlatforms.tenantId], references: [tenants.id] }),
}));

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one, many }) => ({
  tenant: one(tenants, { fields: [webhookEndpoints.tenantId], references: [tenants.id] }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  endpoint: one(webhookEndpoints, { fields: [webhookDeliveries.webhookEndpointId], references: [webhookEndpoints.id] }),
}));

export const csvImportJobsRelations = relations(csvImportJobs, ({ one }) => ({
  tenant: one(tenants, { fields: [csvImportJobs.tenantId], references: [tenants.id] }),
}));
