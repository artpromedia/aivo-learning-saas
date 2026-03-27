import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { BrainProfileService } from "../../services/brain-profile.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function brainVersionsRoute(app: FastifyInstance) {
  app.get(
    "/family/brain/:learnerId/versions",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new BrainProfileService(app);
      const data = await service.getVersions(learnerId);
      return reply.send(data);
    },
  );
}
