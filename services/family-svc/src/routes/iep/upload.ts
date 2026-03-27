import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { IepService } from "../../services/iep.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileBase64: z.string().min(1),
});

export async function iepUploadRoute(app: FastifyInstance) {
  app.post(
    "/family/iep/:learnerId/upload",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { fileName, fileType, fileBase64 } = bodySchema.parse(request.body);
      const buffer = Buffer.from(fileBase64, "base64");
      const service = new IepService(app);
      const doc = await service.uploadDocument(learnerId, request.user.sub, buffer, fileType, fileName);
      return reply.status(201).send(doc);
    },
  );
}
