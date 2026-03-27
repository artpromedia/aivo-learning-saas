import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { IepService } from "../../services/iep.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function iepDocumentsRoute(app: FastifyInstance) {
  app.get(
    "/family/iep/:learnerId/documents",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new IepService(app);
      const documents = await service.getDocuments(learnerId);
      return reply.send({ documents });
    },
  );
}
