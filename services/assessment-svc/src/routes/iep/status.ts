import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { iepDocuments } from "@aivo/db";
import { authenticate } from "../../middleware/authenticate.js";

export async function iepStatusRoute(app: FastifyInstance) {
  app.get(
    "/assessment/iep/:documentId/status",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { documentId } = request.params as { documentId: string };

      const [doc] = await app.db
        .select()
        .from(iepDocuments)
        .where(eq(iepDocuments.id, documentId))
        .limit(1);

      if (!doc) {
        return reply.status(404).send({ error: "Document not found" });
      }

      const statusMap: Record<string, string> = {
        PENDING: "processing",
        PARSING: "processing",
        PARSED: "completed",
        CONFIRMED: "completed",
        FAILED: "error",
      };

      return reply.send({
        status: statusMap[doc.parseStatus] ?? "processing",
        data: doc.parseStatus === "PARSED" || doc.parseStatus === "CONFIRMED"
          ? doc.parsedData
          : undefined,
        error: doc.parseStatus === "FAILED" ? "IEP parsing failed" : undefined,
      });
    },
  );
}
