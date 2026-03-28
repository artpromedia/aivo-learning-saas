import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const serviceStatusEnum = pgEnum("service_status", [
  "OPERATIONAL",
  "DEGRADED",
  "PARTIAL_OUTAGE",
  "MAJOR_OUTAGE",
]);

export const incidentStatusEnum = pgEnum("incident_status", [
  "INVESTIGATING",
  "IDENTIFIED",
  "MONITORING",
  "RESOLVED",
]);

export const incidentImpactEnum = pgEnum("incident_impact", [
  "NONE",
  "MINOR",
  "MAJOR",
  "CRITICAL",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

// ─── Monitored Services ────────────────────────────────────────────────────────

export const monitoredServices = pgTable(
  "monitored_services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 128 }).notNull().unique(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    description: text("description"),
    groupName: varchar("group_name", { length: 64 }).notNull(),
    healthEndpoint: varchar("health_endpoint", { length: 512 }).notNull().default("/health"),
    port: integer("port").notNull(),
    isCritical: boolean("is_critical").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    isEnabled: boolean("is_enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("monitored_services_group_name_idx").on(t.groupName),
    index("monitored_services_display_order_idx").on(t.displayOrder),
  ],
);

export const monitoredServicesRelations = relations(monitoredServices, ({ many }) => ({
  checks: many(serviceChecks),
  uptimeDaily: many(uptimeDaily),
}));

// ─── Service Checks ────────────────────────────────────────────────────────────

export const serviceChecks = pgTable(
  "service_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => monitoredServices.id, { onDelete: "cascade" }),
    status: serviceStatusEnum("status").notNull(),
    responseTimeMs: integer("response_time_ms"),
    checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
    errorMessage: text("error_message"),
  },
  (t) => [
    index("service_checks_service_id_idx").on(t.serviceId),
    index("service_checks_checked_at_idx").on(t.checkedAt),
  ],
);

export const serviceChecksRelations = relations(serviceChecks, ({ one }) => ({
  service: one(monitoredServices, {
    fields: [serviceChecks.serviceId],
    references: [monitoredServices.id],
  }),
}));

// ─── Incidents ─────────────────────────────────────────────────────────────────

export const incidents = pgTable(
  "incidents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 512 }).notNull(),
    status: incidentStatusEnum("status").notNull().default("INVESTIGATING"),
    impact: incidentImpactEnum("impact").notNull().default("NONE"),
    affectedServices: uuid("affected_services").array().notNull().default([]),
    message: text("message").notNull(),
    alertFingerprint: varchar("alert_fingerprint", { length: 255 }),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [
    index("incidents_status_idx").on(t.status),
    index("incidents_created_at_idx").on(t.createdAt),
    index("incidents_alert_fingerprint_idx").on(t.alertFingerprint),
  ],
);

export const incidentsRelations = relations(incidents, ({ many }) => ({
  updates: many(incidentUpdates),
}));

// ─── Incident Updates ──────────────────────────────────────────────────────────

export const incidentUpdates = pgTable(
  "incident_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    incidentId: uuid("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    status: incidentStatusEnum("status").notNull(),
    message: text("message").notNull(),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("incident_updates_incident_id_idx").on(t.incidentId),
    index("incident_updates_created_at_idx").on(t.createdAt),
  ],
);

export const incidentUpdatesRelations = relations(incidentUpdates, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentUpdates.incidentId],
    references: [incidents.id],
  }),
}));

// ─── Maintenance Windows ───────────────────────────────────────────────────────

export const maintenanceWindows = pgTable(
  "maintenance_windows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description"),
    affectedServices: uuid("affected_services").array().notNull().default([]),
    scheduledStart: timestamp("scheduled_start", { withTimezone: true }).notNull(),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }).notNull(),
    status: maintenanceStatusEnum("status").notNull().default("SCHEDULED"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("maintenance_windows_status_idx").on(t.status),
    index("maintenance_windows_scheduled_start_idx").on(t.scheduledStart),
  ],
);

// ─── Uptime Daily ──────────────────────────────────────────────────────────────

export const uptimeDaily = pgTable(
  "uptime_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => monitoredServices.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    uptimePercentage: decimal("uptime_percentage", { precision: 6, scale: 3 }).notNull(),
    totalChecks: integer("total_checks").notNull().default(0),
    successfulChecks: integer("successful_checks").notNull().default(0),
    avgResponseTimeMs: integer("avg_response_time_ms"),
    p50ResponseTimeMs: integer("p50_response_time_ms"),
    p95ResponseTimeMs: integer("p95_response_time_ms"),
    p99ResponseTimeMs: integer("p99_response_time_ms"),
  },
  (t) => [
    uniqueIndex("uptime_daily_service_date_idx").on(t.serviceId, t.date),
    index("uptime_daily_date_idx").on(t.date),
  ],
);

export const uptimeDailyRelations = relations(uptimeDaily, ({ one }) => ({
  service: one(monitoredServices, {
    fields: [uptimeDaily.serviceId],
    references: [monitoredServices.id],
  }),
}));

// ─── Status Subscribers ────────────────────────────────────────────────────────

export const statusSubscribers = pgTable(
  "status_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    unsubscribeToken: varchar("unsubscribe_token", { length: 64 }).notNull().unique(),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("status_subscribers_email_idx").on(t.email),
  ],
);
