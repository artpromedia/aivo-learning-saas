import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { researchCohorts } from "@aivo/db";
import { desc } from "drizzle-orm";

export async function listCohortsRoute(app: FastifyInstance) {
  app.get(
    "/research/cohorts",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        page?: string;
        limit?: string;
      };

      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = Math.min(query.limit ? parseInt(query.limit, 10) : 25, 100);
      const offset = (page - 1) * limit;

      const items = await app.db
        .select()
        .from(researchCohorts)
        .orderBy(desc(researchCohorts.createdAt))
        .limit(limit)
        .offset(offset);

      return reply.send({
        items,
        pagination: {
          page,
          limit,
          total: items.length,
        },
      });
    },
  );
}
