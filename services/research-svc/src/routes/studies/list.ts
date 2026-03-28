import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { interventionStudies } from "@aivo/db";
import { desc, eq, type SQL, and } from "drizzle-orm";

export async function listStudiesRoute(app: FastifyInstance) {
  app.get(
    "/research/studies",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        status?: string;
        page?: string;
        limit?: string;
      };

      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = Math.min(query.limit ? parseInt(query.limit, 10) : 25, 100);
      const offset = (page - 1) * limit;

      const conditions: SQL[] = [];

      if (query.status) {
        conditions.push(
          eq(interventionStudies.status, query.status as "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED"),
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await app.db
        .select()
        .from(interventionStudies)
        .where(whereClause)
        .orderBy(desc(interventionStudies.createdAt))
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
