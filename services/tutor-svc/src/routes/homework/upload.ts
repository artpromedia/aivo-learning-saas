import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkUploadService } from "../../services/homework-upload.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  subject: z.string().optional(),
});

export async function uploadHomeworkRoute(app: FastifyInstance) {
  app.post(
    "/tutors/homework/upload",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = bodySchema.parse(request.body);
      const svc = new HomeworkUploadService(app);
      const assignment = await svc.upload(
        body.learnerId,
        body.fileUrl,
        body.fileType,
        body.subject,
      );
      return reply.status(201).send({ assignment });
    },
  );
}
