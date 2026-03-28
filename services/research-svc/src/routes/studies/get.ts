import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { interventionStudies } from "@aivo/db";
import { eq } from "drizzle-orm";

export async function getStudyRoute(app: FastifyInstance) {
  app.get(
    "/research/studies/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const [study] = await app.db
        .select()
        .from(interventionStudies)
        .where(eq(interventionStudies.id, id))
        .limit(1);

      if (!study) {
        return reply.status(404).send({ error: "Study not found" });
      }

      return reply.send({ study });
    },
  );
}
