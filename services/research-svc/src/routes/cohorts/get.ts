import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { researchCohorts } from "@aivo/db";
import { eq } from "drizzle-orm";

export async function getCohortRoute(app: FastifyInstance) {
  app.get(
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

      return reply.send({ cohort });
    },
  );
}
