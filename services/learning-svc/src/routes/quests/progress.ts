import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { QuestService } from "../../services/quest.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
});

export async function questProgressRoute(app: FastifyInstance) {
  app.get(
    "/learning/quests/progress/:learnerId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new QuestService(app);
      const progress = await service.getProgress(learnerId);
      return reply.send({ progress });
    },
  );
}
