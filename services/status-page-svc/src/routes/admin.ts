import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import {
  incidents,
  incidentUpdates,
  maintenanceWindows,
} from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { requirePlatformAdmin } from "../middleware/authenticate.js";

const createIncidentSchema = z.object({
  title: z.string().min(1).max(512),
  impact: z.enum(["NONE", "MINOR", "MAJOR", "CRITICAL"]),
  affectedServices: z.array(z.string().uuid()),
  message: z.string().min(1),
});

const updateIncidentSchema = z.object({
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]).optional(),
  impact: z.enum(["NONE", "MINOR", "MAJOR", "CRITICAL"]).optional(),
  message: z.string().optional(),
});

const addIncidentUpdateSchema = z.object({
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
  message: z.string().min(1),
});

const createMaintenanceSchema = z.object({
  title: z.string().min(1).max(512),
  description: z.string().optional(),
  affectedServices: z.array(z.string().uuid()),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
});

const updateMaintenanceSchema = z.object({
  title: z.string().min(1).max(512).optional(),
  description: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
});

export async function adminRoutes(app: FastifyInstance) {
  app.post(
    "/status/incidents",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const body = createIncidentSchema.parse(request.body);

      const [incident] = await app.db
        .insert(incidents)
        .values({
          title: body.title,
          impact: body.impact,
          affectedServices: body.affectedServices,
          message: body.message,
          createdBy: request.user.sub,
        })
        .returning();

      await app.db.insert(incidentUpdates).values({
        incidentId: incident.id,
        status: "INVESTIGATING",
        message: body.message,
        createdBy: request.user.sub,
      });

      await publishEvent(app.nats, "status.incident.created", {
        incidentId: incident.id,
        title: incident.title,
        impact: incident.impact,
        affectedServices: incident.affectedServices,
        message: incident.message,
      });

      await publishEvent(app.nats, "status.incident.notify", {
        incidentId: incident.id,
        templateSlug: "incident_created",
        templateData: {
          title: incident.title,
          impact: incident.impact,
          message: incident.message,
          services: body.affectedServices,
        },
      });

      return reply.status(201).send({ incident });
    },
  );

  app.patch(
    "/status/incidents/:id",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateIncidentSchema.parse(request.body);

      const updateValues: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (body.status) updateValues.status = body.status;
      if (body.impact) updateValues.impact = body.impact;
      if (body.message) updateValues.message = body.message;
      if (body.status === "RESOLVED") updateValues.resolvedAt = new Date();

      const [updated] = await app.db
        .update(incidents)
        .set(updateValues)
        .where(eq(incidents.id, id))
        .returning();

      if (!updated) {
        return reply.status(404).send({ error: "Incident not found" });
      }

      await publishEvent(app.nats, "status.incident.updated", {
        incidentId: updated.id,
        title: updated.title,
        status: updated.status,
        impact: updated.impact,
        message: body.message ?? updated.message,
      });

      return reply.send({ incident: updated });
    },
  );

  app.post(
    "/status/incidents/:id/updates",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = addIncidentUpdateSchema.parse(request.body);

      const [existing] = await app.db
        .select()
        .from(incidents)
        .where(eq(incidents.id, id))
        .limit(1);

      if (!existing) {
        return reply.status(404).send({ error: "Incident not found" });
      }

      const [update] = await app.db
        .insert(incidentUpdates)
        .values({
          incidentId: id,
          status: body.status,
          message: body.message,
          createdBy: request.user.sub,
        })
        .returning();

      const updateValues: Record<string, unknown> = {
        status: body.status,
        updatedAt: new Date(),
      };
      if (body.status === "RESOLVED") updateValues.resolvedAt = new Date();

      await app.db.update(incidents).set(updateValues).where(eq(incidents.id, id));

      await publishEvent(app.nats, "status.incident.updated", {
        incidentId: id,
        title: existing.title,
        status: body.status,
        impact: existing.impact,
        message: body.message,
      });

      await publishEvent(app.nats, "status.incident.notify", {
        incidentId: id,
        templateSlug: body.status === "RESOLVED" ? "incident_resolved" : "incident_updated",
        templateData: {
          title: existing.title,
          status: body.status,
          message: body.message,
        },
      });

      return reply.status(201).send({ update });
    },
  );

  app.post(
    "/status/incidents/:id/resolve",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const [existing] = await app.db
        .select()
        .from(incidents)
        .where(eq(incidents.id, id))
        .limit(1);

      if (!existing) {
        return reply.status(404).send({ error: "Incident not found" });
      }

      const resolvedAt = new Date();

      const [resolved] = await app.db
        .update(incidents)
        .set({
          status: "RESOLVED",
          resolvedAt,
          updatedAt: resolvedAt,
        })
        .where(eq(incidents.id, id))
        .returning();

      await app.db.insert(incidentUpdates).values({
        incidentId: id,
        status: "RESOLVED",
        message: "This incident has been resolved.",
        createdBy: request.user.sub,
      });

      await publishEvent(app.nats, "status.incident.resolved", {
        incidentId: id,
        title: existing.title,
        affectedServices: existing.affectedServices,
        resolvedAt: resolvedAt.toISOString(),
      });

      await publishEvent(app.nats, "status.incident.notify", {
        incidentId: id,
        templateSlug: "incident_resolved",
        templateData: {
          title: existing.title,
          resolvedAt: resolvedAt.toISOString(),
        },
      });

      return reply.send({ incident: resolved });
    },
  );

  app.get(
    "/status/incidents",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const query = request.query as { page?: string; limit?: string; status?: string };
      const page = parseInt(query.page ?? "1", 10);
      const limit = Math.min(parseInt(query.limit ?? "20", 10), 100);
      const offset = (page - 1) * limit;

      let queryBuilder = app.db.select().from(incidents).$dynamic();

      if (query.status) {
        queryBuilder = queryBuilder.where(
          eq(incidents.status, query.status as typeof incidents.status.enumValues[number]),
        );
      }

      const results = await queryBuilder
        .orderBy(desc(incidents.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await app.db
        .select({ count: sql<number>`count(*)` })
        .from(incidents);

      return reply.send({
        incidents: results,
        pagination: { page, limit, total: Number(count) },
      });
    },
  );

  app.post(
    "/status/maintenance",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const body = createMaintenanceSchema.parse(request.body);

      const [maintenance] = await app.db
        .insert(maintenanceWindows)
        .values({
          title: body.title,
          description: body.description,
          affectedServices: body.affectedServices,
          scheduledStart: new Date(body.scheduledStart),
          scheduledEnd: new Date(body.scheduledEnd),
          createdBy: request.user.sub,
        })
        .returning();

      await publishEvent(app.nats, "status.maintenance.scheduled", {
        maintenanceId: maintenance.id,
        title: maintenance.title,
        affectedServices: maintenance.affectedServices,
        scheduledStart: maintenance.scheduledStart.toISOString(),
        scheduledEnd: maintenance.scheduledEnd.toISOString(),
      });

      await publishEvent(app.nats, "status.incident.notify", {
        incidentId: maintenance.id,
        templateSlug: "maintenance_scheduled",
        templateData: {
          title: maintenance.title,
          description: maintenance.description,
          scheduledStart: maintenance.scheduledStart.toISOString(),
          scheduledEnd: maintenance.scheduledEnd.toISOString(),
        },
      });

      return reply.status(201).send({ maintenance });
    },
  );

  app.patch(
    "/status/maintenance/:id",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateMaintenanceSchema.parse(request.body);

      const updateValues: Record<string, unknown> = {};
      if (body.title) updateValues.title = body.title;
      if (body.description !== undefined) updateValues.description = body.description;
      if (body.status) updateValues.status = body.status;
      if (body.scheduledStart) updateValues.scheduledStart = new Date(body.scheduledStart);
      if (body.scheduledEnd) updateValues.scheduledEnd = new Date(body.scheduledEnd);

      const [updated] = await app.db
        .update(maintenanceWindows)
        .set(updateValues)
        .where(eq(maintenanceWindows.id, id))
        .returning();

      if (!updated) {
        return reply.status(404).send({ error: "Maintenance window not found" });
      }

      if (body.status === "IN_PROGRESS") {
        await publishEvent(app.nats, "status.incident.notify", {
          incidentId: id,
          templateSlug: "maintenance_started",
          templateData: { title: updated.title },
        });
      } else if (body.status === "COMPLETED") {
        await publishEvent(app.nats, "status.incident.notify", {
          incidentId: id,
          templateSlug: "maintenance_completed",
          templateData: { title: updated.title },
        });
      }

      return reply.send({ maintenance: updated });
    },
  );

  app.delete(
    "/status/maintenance/:id",
    { preHandler: [requirePlatformAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const [deleted] = await app.db
        .update(maintenanceWindows)
        .set({ status: "CANCELLED" })
        .where(eq(maintenanceWindows.id, id))
        .returning();

      if (!deleted) {
        return reply.status(404).send({ error: "Maintenance window not found" });
      }

      return reply.send({ maintenance: deleted });
    },
  );
}
