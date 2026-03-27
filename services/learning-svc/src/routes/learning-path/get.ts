import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { LearningPathService } from "../../services/learning-path.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
});

export async function getLearningPathRoute(app: FastifyInstance) {
  app.get(
    "/learning/path/:learnerId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new LearningPathService(app);
      const path = await service.generateDailyPath(learnerId);
      return reply.send(path);
    },
  );
}
