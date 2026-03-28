import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { researchExports } from "@aivo/db";
import { desc, eq, type SQL, and } from "drizzle-orm";

export async function listExportsRoute(app: FastifyInstance) {
  app.get(
    "/research/exports",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        cohortId?: string;
        status?: string;
        page?: string;
        limit?: string;
      };

      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = Math.min(query.limit ? parseInt(query.limit, 10) : 25, 100);
      const offset = (page - 1) * limit;

      const conditions: SQL[] = [];

      if (query.cohortId) {
        conditions.push(eq(researchExports.cohortId, query.cohortId));
      }
      if (query.status) {
        conditions.push(eq(researchExports.status, query.status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await app.db
        .select()
        .from(researchExports)
        .where(whereClause)
        .orderBy(desc(researchExports.requestedAt))
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
