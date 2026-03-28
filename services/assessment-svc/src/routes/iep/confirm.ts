import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { iepDocuments } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { authenticate } from "../../middleware/authenticate.js";

const bodySchema = z.object({
  data: z.record(z.string(), z.unknown()).optional(),
});

export async function iepConfirmRoute(app: FastifyInstance) {
  app.post(
    "/assessment/iep/:documentId/confirm",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { documentId } = request.params as { documentId: string };
      const body = bodySchema.parse(request.body);

      const [doc] = await app.db
        .select()
        .from(iepDocuments)
        .where(eq(iepDocuments.id, documentId))
        .limit(1);

      if (!doc) {
        return reply.status(404).send({ error: "Document not found" });
      }

      if (doc.parseStatus !== "PARSED") {
        return reply.status(400).send({ error: "Document is not in a confirmable state" });
      }

      // Update document with confirmation
      const confirmedData = body.data ?? doc.parsedData;
      await app.db
        .update(iepDocuments)
        .set({
          parseStatus: "CONFIRMED",
          confirmedBy: request.user.sub,
          confirmedAt: new Date(),
          parsedData: confirmedData,
        })
        .where(eq(iepDocuments.id, documentId));

      // Emit confirmed event
      await publishEvent(app.nats, "assessment.iep.confirmed", {
        learnerId: doc.learnerId,
        documentId,
        confirmedBy: request.user.sub,
      });

      app.log.info({ documentId }, "IEP document confirmed");

      return reply.send({ status: "confirmed" });
    },
  );
}
