import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkService } from "../../services/homework.service.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "application/pdf",
]);

export async function uploadHomeworkRoute(app: FastifyInstance) {
  // Multipart file upload endpoint
  app.post(
    "/tutors/homework/upload",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: "File is required" });
      }

      const mimeType = data.mimetype;
      if (!ALLOWED_TYPES.has(mimeType)) {
        return reply
          .status(400)
          .send({ error: `Unsupported file type: ${mimeType}` });
      }

      const fileBuffer = await data.toBuffer();
      if (fileBuffer.length > MAX_FILE_SIZE) {
        return reply
          .status(413)
          .send({ error: "File too large. Maximum size is 10MB." });
      }

      // Extract learnerId and optional subject from fields
      const fields = data.fields as Record<
        string,
        { value?: string } | undefined
      >;
      const learnerId = fields.learnerId?.value;
      const subject = fields.subject?.value;

      if (!learnerId) {
        return reply
          .status(400)
          .send({ error: "learnerId field is required" });
      }

      const svc = new HomeworkService(app);
      const result = await svc.uploadAndProcess(
        learnerId,
        fileBuffer,
        data.filename ?? "homework",
        mimeType,
        subject,
      );

      if (result.locked) {
        return reply.status(403).send({
          locked: true,
          requiredSku: result.requiredSku,
          assignment: result.assignment,
        });
      }

      return reply.status(201).send({ assignment: result.assignment });
    },
  );

  // JSON URL-based upload (backward compatible)
  app.post(
    "/tutors/homework/upload-url",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const bodySchema = z.object({
        learnerId: z.string().uuid(),
        fileUrl: z.string().url(),
        fileType: z.string().min(1),
        subject: z.string().optional(),
      });

      const body = bodySchema.parse(request.body);

      // Fetch the file from the URL
      const res = await fetch(body.fileUrl);
      if (!res.ok) {
        return reply
          .status(400)
          .send({ error: "Failed to fetch file from URL" });
      }

      const arrayBuf = await res.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuf);

      const svc = new HomeworkService(app);
      const result = await svc.uploadAndProcess(
        body.learnerId,
        fileBuffer,
        "homework-from-url",
        body.fileType,
        body.subject,
      );

      if (result.locked) {
        return reply.status(403).send({
          locked: true,
          requiredSku: result.requiredSku,
          assignment: result.assignment,
        });
      }

      return reply.status(201).send({ assignment: result.assignment });
    },
  );
}
