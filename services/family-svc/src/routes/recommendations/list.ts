import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { RecommendationService } from "../../services/recommendation.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function listRecommendationsRoute(app: FastifyInstance) {
  app.get(
    "/family/recommendations/:learnerId",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new RecommendationService(app);
      const result = await service.getPendingAndRecent(learnerId);
      return reply.send(result);
    },
  );
}
