import type { FastifyInstance } from "fastify";
import { eq, desc, gte, and, or, ne, sql } from "drizzle-orm";
import {
  monitoredServices,
  serviceChecks,
  incidents,
  incidentUpdates,
  maintenanceWindows,
  uptimeDaily,
} from "@aivo/db";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/status", async (_request, reply) => {
    const services = await app.db
      .select()
      .from(monitoredServices)
      .where(eq(monitoredServices.isEnabled, true))
      .orderBy(monitoredServices.displayOrder);

    const serviceStatuses = await Promise.all(
      services.map(async (svc) => {
        const [latest] = await app.db
          .select()
          .from(serviceChecks)
          .where(eq(serviceChecks.serviceId, svc.id))
          .orderBy(desc(serviceChecks.checkedAt))
          .limit(1);

        return {
          id: svc.id,
          name: svc.name,
          displayName: svc.displayName,
          group: svc.groupName,
          status: latest?.status ?? "OPERATIONAL",
          responseTimeMs: latest?.responseTimeMs ?? null,
          lastChecked: latest?.checkedAt?.toISOString() ?? null,
        };
      }),
    );

    const activeIncidents = await app.db
      .select()
      .from(incidents)
      .where(ne(incidents.status, "RESOLVED"))
      .orderBy(desc(incidents.createdAt));

    const now = new Date();
    const upcomingMaintenance = await app.db
      .select()
      .from(maintenanceWindows)
      .where(
        and(
          or(
            eq(maintenanceWindows.status, "SCHEDULED"),
            eq(maintenanceWindows.status, "IN_PROGRESS"),
          ),
          gte(maintenanceWindows.scheduledEnd, now),
        ),
      )
      .orderBy(maintenanceWindows.scheduledStart);

    const overallStatus = computeOverallStatus(serviceStatuses, services);

    return reply.send({
      overall: overallStatus,
      services: serviceStatuses,
      activeIncidents,
      upcomingMaintenance,
      updatedAt: new Date().toISOString(),
    });
  });

  app.get("/status/history", async (request, reply) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const pastIncidents = await app.db
      .select()
      .from(incidents)
      .where(gte(incidents.createdAt, ninetyDaysAgo))
      .orderBy(desc(incidents.createdAt))
      .limit(100);

    const incidentIds = pastIncidents.map((i) => i.id);
    let updates: (typeof incidentUpdates.$inferSelect)[] = [];
    if (incidentIds.length > 0) {
      updates = await app.db
        .select()
        .from(incidentUpdates)
        .where(sql`${incidentUpdates.incidentId} = ANY(${incidentIds})`)
        .orderBy(desc(incidentUpdates.createdAt));
    }

    const incidentsWithUpdates = pastIncidents.map((incident) => ({
      ...incident,
      updates: updates.filter((u) => u.incidentId === incident.id),
    }));

    return reply.send({ incidents: incidentsWithUpdates });
  });

  app.get("/status/uptime", async (_request, reply) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateStr = ninetyDaysAgo.toISOString().split("T")[0];

    const services = await app.db
      .select()
      .from(monitoredServices)
      .where(eq(monitoredServices.isEnabled, true))
      .orderBy(monitoredServices.displayOrder);

    const uptimeData = await Promise.all(
      services.map(async (svc) => {
        const daily = await app.db
          .select()
          .from(uptimeDaily)
          .where(
            and(
              eq(uptimeDaily.serviceId, svc.id),
              gte(uptimeDaily.date, dateStr),
            ),
          )
          .orderBy(uptimeDaily.date);

        const totalUptime =
          daily.length > 0
            ? (
                daily.reduce(
                  (sum, d) => sum + parseFloat(d.uptimePercentage),
                  0,
                ) / daily.length
              ).toFixed(3)
            : "100.000";

        return {
          serviceId: svc.id,
          serviceName: svc.displayName,
          group: svc.groupName,
          uptimePercentage90d: totalUptime,
          daily,
        };
      }),
    );

    return reply.send({ uptime: uptimeData });
  });

  app.get("/status/services", async (_request, reply) => {
    const services = await app.db
      .select()
      .from(monitoredServices)
      .where(eq(monitoredServices.isEnabled, true))
      .orderBy(monitoredServices.displayOrder);

    const serviceStatuses = await Promise.all(
      services.map(async (svc) => {
        const [latest] = await app.db
          .select()
          .from(serviceChecks)
          .where(eq(serviceChecks.serviceId, svc.id))
          .orderBy(desc(serviceChecks.checkedAt))
          .limit(1);

        return {
          id: svc.id,
          name: svc.name,
          displayName: svc.displayName,
          description: svc.description,
          group: svc.groupName,
          status: latest?.status ?? "OPERATIONAL",
          responseTimeMs: latest?.responseTimeMs ?? null,
          isCritical: svc.isCritical,
        };
      }),
    );

    return reply.send({ services: serviceStatuses });
  });
}

function computeOverallStatus(
  serviceStatuses: { status: string }[],
  services: (typeof monitoredServices.$inferSelect)[],
): string {
  if (serviceStatuses.length === 0) return "OPERATIONAL";

  const criticalIds = new Set(services.filter((s) => s.isCritical).map((s) => s.id));
  const criticalDown = serviceStatuses.filter(
    (s, i) =>
      criticalIds.has(services[i]?.id ?? "") &&
      (s.status === "MAJOR_OUTAGE" || s.status === "PARTIAL_OUTAGE"),
  );

  if (criticalDown.length > 1) return "MAJOR_OUTAGE";
  if (criticalDown.length === 1) return "PARTIAL_OUTAGE";

  const hasAnyDegraded = serviceStatuses.some((s) => s.status === "DEGRADED");
  if (hasAnyDegraded) return "DEGRADED";

  const hasAnyOutage = serviceStatuses.some(
    (s) => s.status === "PARTIAL_OUTAGE" || s.status === "MAJOR_OUTAGE",
  );
  if (hasAnyOutage) return "PARTIAL_OUTAGE";

  return "OPERATIONAL";
}
