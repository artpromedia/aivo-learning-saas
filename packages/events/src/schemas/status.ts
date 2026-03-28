import { z } from "zod";

// ─── status.service.changed ────────────────────────────────────────────────────
export const StatusServiceChangedSchema = z.object({
  serviceId: z.string().uuid(),
  serviceName: z.string(),
  previousStatus: z.enum(["OPERATIONAL", "DEGRADED", "PARTIAL_OUTAGE", "MAJOR_OUTAGE"]),
  currentStatus: z.enum(["OPERATIONAL", "DEGRADED", "PARTIAL_OUTAGE", "MAJOR_OUTAGE"]),
  responseTimeMs: z.number().optional(),
  checkedAt: z.string().datetime(),
});
export type StatusServiceChanged = z.infer<typeof StatusServiceChangedSchema>;

// ─── status.incident.created ───────────────────────────────────────────────────
export const StatusIncidentCreatedSchema = z.object({
  incidentId: z.string().uuid(),
  title: z.string(),
  impact: z.enum(["NONE", "MINOR", "MAJOR", "CRITICAL"]),
  affectedServices: z.array(z.string().uuid()),
  message: z.string(),
});
export type StatusIncidentCreated = z.infer<typeof StatusIncidentCreatedSchema>;

// ─── status.incident.updated ───────────────────────────────────────────────────
export const StatusIncidentUpdatedSchema = z.object({
  incidentId: z.string().uuid(),
  title: z.string(),
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
  impact: z.enum(["NONE", "MINOR", "MAJOR", "CRITICAL"]),
  message: z.string(),
});
export type StatusIncidentUpdated = z.infer<typeof StatusIncidentUpdatedSchema>;

// ─── status.incident.resolved ──────────────────────────────────────────────────
export const StatusIncidentResolvedSchema = z.object({
  incidentId: z.string().uuid(),
  title: z.string(),
  affectedServices: z.array(z.string().uuid()),
  resolvedAt: z.string().datetime(),
});
export type StatusIncidentResolved = z.infer<typeof StatusIncidentResolvedSchema>;

// ─── status.incident.notify ────────────────────────────────────────────────────
export const StatusIncidentNotifySchema = z.object({
  incidentId: z.string().uuid(),
  templateSlug: z.string(),
  templateData: z.record(z.string(), z.unknown()),
});
export type StatusIncidentNotify = z.infer<typeof StatusIncidentNotifySchema>;

// ─── status.maintenance.scheduled ──────────────────────────────────────────────
export const StatusMaintenanceScheduledSchema = z.object({
  maintenanceId: z.string().uuid(),
  title: z.string(),
  affectedServices: z.array(z.string().uuid()),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
});
export type StatusMaintenanceScheduled = z.infer<typeof StatusMaintenanceScheduledSchema>;

export const STATUS_SUBJECTS = {
  "status.service.changed": "aivo.status.service.changed",
  "status.incident.created": "aivo.status.incident.created",
  "status.incident.updated": "aivo.status.incident.updated",
  "status.incident.resolved": "aivo.status.incident.resolved",
  "status.incident.notify": "aivo.status.incident.notify",
  "status.maintenance.scheduled": "aivo.status.maintenance.scheduled",
} as const;

export const STATUS_SCHEMAS = {
  "status.service.changed": StatusServiceChangedSchema,
  "status.incident.created": StatusIncidentCreatedSchema,
  "status.incident.updated": StatusIncidentUpdatedSchema,
  "status.incident.resolved": StatusIncidentResolvedSchema,
  "status.incident.notify": StatusIncidentNotifySchema,
  "status.maintenance.scheduled": StatusMaintenanceScheduledSchema,
} as const;
