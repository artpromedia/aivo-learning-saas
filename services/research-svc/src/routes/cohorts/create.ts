import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { researchCohorts } from "@aivo/db";
import { AuditService } from "../../services/audit.service.js";

export async function createCohortRoute(app: FastifyInstance) {
  app.post(
    "/research/cohorts",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        description?: string;
        filters?: Record<string, unknown>;
        learnerCount?: number;
      };

      if (!body.name) {
        return reply.status(400).send({ error: "name is required" });
      }

      if (body.learnerCount !== undefined && body.learnerCount < 30) {
        return reply.status(400).send({ error: "Cohort must have at least 30 learners for anonymization" });
      }

      const [cohort] = await app.db
        .insert(researchCohorts)
        .values({
          name: body.name,
          description: body.description ?? null,
          filters: body.filters ?? {},
          learnerCount: body.learnerCount ?? 0,
          createdBy: request.user.sub,
        })
        .returning();

      const audit = new AuditService(app);
      await audit.log({
        adminUserId: request.user.sub,
        action: "research.cohort.created",
        resourceType: "research_cohort",
        resourceId: cohort.id,
        details: { name: body.name },
        ipAddress: request.ip,
      });

      return reply.status(201).send({ cohort });
    },
  );
}
