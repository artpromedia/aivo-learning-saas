import type { FastifyInstance } from "fastify";
import { eq, and, ne } from "drizzle-orm";
import { incidents, monitoredServices } from "@aivo/db";
import { publishEvent } from "@aivo/events";

interface AlertmanagerPayload {
  version: string;
  status: "firing" | "resolved";
  alerts: AlertmanagerAlert[];
}

interface AlertmanagerAlert {
  status: "firing" | "resolved";
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt: string;
  fingerprint: string;
}

const ALERT_IMPACT_MAP: Record<string, "NONE" | "MINOR" | "MAJOR" | "CRITICAL"> = {
  critical: "MAJOR",
  warning: "MINOR",
  info: "NONE",
};

export async function webhookRoutes(app: FastifyInstance) {
  app.post("/status/webhook/alertmanager", async (request, reply) => {
    const payload = request.body as AlertmanagerPayload;

    if (!payload.alerts || !Array.isArray(payload.alerts)) {
      return reply.status(400).send({ error: "Invalid Alertmanager payload" });
    }

    const results = [];

    for (const alert of payload.alerts) {
      const fingerprint = alert.fingerprint;
      const serviceName = alert.labels.service ?? alert.labels.job ?? "unknown";
      const severity = alert.labels.severity ?? "warning";
      const alertName = alert.labels.alertname ?? "Unknown Alert";

      if (alert.status === "firing") {
        const [existingIncident] = await app.db
          .select()
          .from(incidents)
          .where(
            and(
              eq(incidents.alertFingerprint, fingerprint),
              ne(incidents.status, "RESOLVED"),
            ),
          )
          .limit(1);

        if (existingIncident) {
          results.push({
            fingerprint,
            action: "deduplicated",
            incidentId: existingIncident.id,
          });
          continue;
        }

        const [service] = await app.db
          .select()
          .from(monitoredServices)
          .where(eq(monitoredServices.name, serviceName))
          .limit(1);

        const affectedServices = service ? [service.id] : [];
        const impact = ALERT_IMPACT_MAP[severity] ?? "MINOR";
        const summary =
          alert.annotations.summary ??
          `${alertName} triggered for ${serviceName}`;

        const [incident] = await app.db
          .insert(incidents)
          .values({
            title: `[Auto] ${alertName}: ${serviceName}`,
            status: "INVESTIGATING",
            impact,
            affectedServices,
            message: summary,
            alertFingerprint: fingerprint,
          })
          .returning();

        await publishEvent(app.nats, "status.incident.created", {
          incidentId: incident.id,
          title: incident.title,
          impact: incident.impact,
          affectedServices,
          message: incident.message,
        });

        await publishEvent(app.nats, "status.incident.notify", {
          incidentId: incident.id,
          templateSlug: "incident_created",
          templateData: {
            title: incident.title,
            impact: incident.impact,
            message: incident.message,
            services: affectedServices,
          },
        });

        results.push({
          fingerprint,
          action: "created",
          incidentId: incident.id,
        });
      } else if (alert.status === "resolved") {
        const [existingIncident] = await app.db
          .select()
          .from(incidents)
          .where(
            and(
              eq(incidents.alertFingerprint, fingerprint),
              ne(incidents.status, "RESOLVED"),
            ),
          )
          .limit(1);

        if (!existingIncident) {
          results.push({ fingerprint, action: "no_matching_incident" });
          continue;
        }

        const resolvedAt = new Date();
        await app.db
          .update(incidents)
          .set({
            status: "RESOLVED",
            resolvedAt,
            updatedAt: resolvedAt,
          })
          .where(eq(incidents.id, existingIncident.id));

        await publishEvent(app.nats, "status.incident.resolved", {
          incidentId: existingIncident.id,
          title: existingIncident.title,
          affectedServices: existingIncident.affectedServices,
          resolvedAt: resolvedAt.toISOString(),
        });

        await publishEvent(app.nats, "status.incident.notify", {
          incidentId: existingIncident.id,
          templateSlug: "incident_resolved",
          templateData: {
            title: existingIncident.title,
            resolvedAt: resolvedAt.toISOString(),
          },
        });

        results.push({
          fingerprint,
          action: "resolved",
          incidentId: existingIncident.id,
        });
      }
    }

    return reply.send({ processed: results.length, results });
  });
}
