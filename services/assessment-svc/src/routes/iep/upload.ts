import type { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import { iepDocuments } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { authenticate } from "../../middleware/authenticate.js";
import { getConfig } from "../../config.js";

export async function iepUploadRoute(app: FastifyInstance) {
  app.post(
    "/assessment/iep/upload",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const config = getConfig();
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const buffer = await data.toBuffer();
      const fileType = data.mimetype;

      if (!fileType.includes("pdf") && !fileType.includes("image")) {
        return reply.status(400).send({ error: "Only PDF and image files are accepted" });
      }

      if (buffer.length > 20 * 1024 * 1024) {
        return reply.status(400).send({ error: "File size must be under 20MB" });
      }

      // Extract learnerId from multipart fields
      const learnerId = (data.fields?.learnerId as { value?: string })?.value ?? "";
      if (!learnerId) {
        return reply.status(400).send({ error: "learnerId is required" });
      }

      const documentId = randomUUID();
      let fileUrl: string;

      if (config.S3_BUCKET) {
        // S3 upload path (production)
        fileUrl = `s3://${config.S3_BUCKET}/iep/${documentId}/${data.filename}`;
        app.log.info({ fileUrl }, "S3 upload would happen here in production");
        // In production, upload to S3 here
      } else {
        // Local filesystem (development)
        const uploadDir = join(config.UPLOAD_DIR, "iep", documentId);
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = join(uploadDir, data.filename ?? "document");
        await fs.writeFile(filePath, buffer);
        fileUrl = `file://${filePath}`;
      }

      // Store document record
      const [doc] = await app.db
        .insert(iepDocuments)
        .values({
          id: documentId,
          learnerId,
          uploadedBy: request.user.sub,
          fileUrl,
          fileType,
          parseStatus: "PENDING",
        })
        .returning();

      // Emit upload event — subscriber will trigger AI parsing
      await publishEvent(app.nats, "assessment.iep.uploaded", {
        learnerId,
        documentId,
        fileUrl,
      });

      app.log.info({ documentId, learnerId }, "IEP document uploaded");

      return reply.status(201).send({ id: doc.id });
    },
  );
}
