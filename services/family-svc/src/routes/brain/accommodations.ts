import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { BrainProfileService } from "../../services/brain-profile.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function brainAccommodationsRoute(app: FastifyInstance) {
  app.get(
    "/family/brain/:learnerId/accommodations",
    { preHandler: [authenticate, requireLearnerAccess("parent", "teacher")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new BrainProfileService(app);
      const data = await service.getAccommodations(learnerId);
      return reply.send(data);
    },
  );
}
