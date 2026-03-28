import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { researchExports } from "@aivo/db";
import { eq } from "drizzle-orm";

export async function getExportRoute(app: FastifyInstance) {
  app.get(
    "/research/exports/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const [exportRecord] = await app.db
        .select()
        .from(researchExports)
        .where(eq(researchExports.id, id))
        .limit(1);

      if (!exportRecord) {
        return reply.status(404).send({ error: "Export not found" });
      }

      return reply.send({ export: exportRecord });
    },
  );
}
