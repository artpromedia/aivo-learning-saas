import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { LearningPathService } from "../../services/learning-path.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
});

export async function getNextRecommendationRoute(app: FastifyInstance) {
  app.get(
    "/learning/path/:learnerId/next",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new LearningPathService(app);
      const next = await service.getNextRecommendation(learnerId);
      if (!next) {
        return reply.send({ recommendation: null, message: "No activities recommended right now" });
      }
      return reply.send({ recommendation: next });
    },
  );
}
