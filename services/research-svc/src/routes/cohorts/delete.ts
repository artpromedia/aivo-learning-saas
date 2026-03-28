import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { researchCohorts } from "@aivo/db";
import { eq } from "drizzle-orm";
import { AuditService } from "../../services/audit.service.js";

export async function deleteCohortRoute(app: FastifyInstance) {
  app.delete(
    "/research/cohorts/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const [cohort] = await app.db
        .select()
        .from(researchCohorts)
        .where(eq(researchCohorts.id, id))
        .limit(1);

      if (!cohort) {
        return reply.status(404).send({ error: "Cohort not found" });
      }

      await app.db
        .delete(researchCohorts)
        .where(eq(researchCohorts.id, id));

      const audit = new AuditService(app);
      await audit.log({
        adminUserId: request.user.sub,
        action: "research.cohort.deleted",
        resourceType: "research_cohort",
        resourceId: id,
        details: { name: cohort.name },
        ipAddress: request.ip,
      });

      return reply.status(204).send();
    },
  );
}
