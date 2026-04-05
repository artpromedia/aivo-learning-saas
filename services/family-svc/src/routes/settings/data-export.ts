import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, inArray, desc } from "drizzle-orm";
import { dataLifecycleEvents } from "@aivo/db";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function dataExportRoute(app: FastifyInstance) {
  // Request brain data export
  app.post(
    "/family/learners/:learnerId/export",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);

      const res = await fetch(
        `${app.brainClient.baseUrl}/brain/${learnerId}/export`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!res.ok) {
        return reply.status(res.status).send({ error: "Export request failed" });
      }

      const data = await res.json();
      return reply.status(202).send(data);
    },
  );

  // Check export status
  app.get(
    "/family/learners/:learnerId/export/status",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);

      // Check the latest export lifecycle event
      const [event] = await app.db
        .select({
          event_type: dataLifecycleEvents.eventType,
          metadata: dataLifecycleEvents.metadata,
          created_at: dataLifecycleEvents.createdAt,
        })
        .from(dataLifecycleEvents)
        .where(
          and(
            eq(dataLifecycleEvents.learnerId, learnerId),
            inArray(dataLifecycleEvents.eventType, ["EXPORT_REQUESTED", "EXPORT_COMPLETED", "EXPORT_FAILED"]),
          ),
        )
        .orderBy(desc(dataLifecycleEvents.createdAt))
        .limit(1);

      if (!event) {
        return reply.send({ status: "none" });
      }

      const metadata = typeof event.metadata === "string"
        ? JSON.parse(event.metadata)
        : event.metadata;

      if (event.event_type === "EXPORT_COMPLETED") {
        return reply.send({
          status: "ready",
          download_url: metadata.download_url,
          expires_at: metadata.expires_at,
          created_at: event.created_at,
        });
      }

      if (event.event_type === "EXPORT_FAILED") {
        return reply.send({ status: "failed", error: metadata.error });
      }

      return reply.send({ status: "processing" });
    },
  );
}
