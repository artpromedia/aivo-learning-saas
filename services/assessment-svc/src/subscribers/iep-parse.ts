import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { iepDocuments } from "@aivo/db";
import { subscribeEvent, publishEvent, ASSESSMENT_SCHEMAS, type Subscription } from "@aivo/events";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;
  const subs: Subscription[] = [];

  // assessment.iep.uploaded → call ai-svc IEP parser → emit assessment.iep.parsed
  try {
    const sub = await subscribeEvent(
      nc,
      "assessment.iep.uploaded",
      ASSESSMENT_SCHEMAS["assessment.iep.uploaded"],
      async (data) => {
        app.log.info({ data }, "Received assessment.iep.uploaded — starting IEP parse");

        try {
          // Update parse status
          await app.db
            .update(iepDocuments)
            .set({ parseStatus: "PARSING" })
            .where(eq(iepDocuments.id, data.documentId));

          // Get the document to determine file type
          const [doc] = await app.db
            .select()
            .from(iepDocuments)
            .where(eq(iepDocuments.id, data.documentId))
            .limit(1);

          if (!doc) {
            app.log.error({ documentId: data.documentId }, "IEP document not found");
            return;
          }

          // Call ai-svc to parse
          const parsedData = await app.aiClient.parseIep(data.fileUrl, doc.fileType);

          // Update document with parsed data
          await app.db
            .update(iepDocuments)
            .set({
              parsedData,
              parseStatus: "PARSED",
            })
            .where(eq(iepDocuments.id, data.documentId));

          // Emit parsed event
          await publishEvent(nc, "assessment.iep.parsed", {
            learnerId: data.learnerId,
            documentId: data.documentId,
            parsedData,
          });

          app.log.info(
            { documentId: data.documentId, learnerId: data.learnerId },
            "IEP document parsed successfully",
          );
        } catch (err) {
          app.log.error({ err, data }, "Failed to parse IEP document");

          // Mark as failed
          await app.db
            .update(iepDocuments)
            .set({ parseStatus: "FAILED" })
            .where(eq(iepDocuments.id, data.documentId));
        }
      },
    );
    subs.push(sub);
  } catch {
    app.log.warn("Could not subscribe to assessment.iep.uploaded");
  }

  // Clean up on close
  app.addHook("onClose", async () => {
    for (const sub of subs) {
      sub.unsubscribe();
    }
  });

  app.log.info("Assessment-svc NATS subscribers set up");
}
