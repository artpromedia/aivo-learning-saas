import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { interventionStudies } from "@aivo/db";
import { eq } from "drizzle-orm";
import { AuditService } from "../../services/audit.service.js";

export async function updateStudyRoute(app: FastifyInstance) {
  app.patch(
    "/research/studies/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const body = request.body as {
        name?: string;
        description?: string;
        hypothesis?: string;
        status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
        endDate?: string;
        results?: Record<string, unknown>;
      };

      const [existing] = await app.db
        .select()
        .from(interventionStudies)
        .where(eq(interventionStudies.id, id))
        .limit(1);

      if (!existing) {
        return reply.status(404).send({ error: "Study not found" });
      }

      const validTransitions: Record<string, string[]> = {
        DRAFT: ["ACTIVE", "ARCHIVED"],
        ACTIVE: ["COMPLETED", "ARCHIVED"],
        COMPLETED: ["ARCHIVED"],
        ARCHIVED: [],
      };

      if (body.status && !validTransitions[existing.status]?.includes(body.status)) {
        return reply.status(400).send({
          error: `Cannot transition from ${existing.status} to ${body.status}`,
        });
      }

      const updateData: Record<string, unknown> = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.hypothesis !== undefined) updateData.hypothesis = body.hypothesis;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.endDate !== undefined) updateData.endDate = body.endDate;
      if (body.results !== undefined) updateData.results = body.results;

      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({ error: "No fields to update" });
      }

      const [updated] = await app.db
        .update(interventionStudies)
        .set(updateData)
        .where(eq(interventionStudies.id, id))
        .returning();

      const audit = new AuditService(app);
      await audit.log({
        adminUserId: request.user.sub,
        action: "research.study.updated",
        resourceType: "intervention_study",
        resourceId: id,
        details: { changes: Object.keys(updateData) },
        ipAddress: request.ip,
      });

      return reply.send({ study: updated });
    },
  );
}
