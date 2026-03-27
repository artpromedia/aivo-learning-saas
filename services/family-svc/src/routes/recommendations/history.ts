import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { RecommendationService } from "../../services/recommendation.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const querySchema = z.object({
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export async function recommendationHistoryRoute(app: FastifyInstance) {
  app.get(
    "/family/recommendations/:learnerId/history",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { limit, offset } = querySchema.parse(request.query);
      const service = new RecommendationService(app);
      const history = await service.getHistory(learnerId, limit, offset);
      return reply.send({ history });
    },
  );
}
