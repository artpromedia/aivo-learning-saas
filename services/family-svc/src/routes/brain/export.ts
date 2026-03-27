import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { DataExportService } from "../../services/data-export.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function brainExportRoute(app: FastifyInstance) {
  app.post(
    "/family/brain/:learnerId/export",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new DataExportService(app);
      const result = await service.initiateExport(learnerId, request.user.sub);
      return reply.status(201).send(result);
    },
  );
}
