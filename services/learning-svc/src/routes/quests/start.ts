import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { QuestService } from "../../services/quest.service.js";

const paramsSchema = z.object({
  worldSlug: z.string().min(1),
});

const bodySchema = z.object({
  learnerId: z.string().uuid(),
});

export async function startQuestRoute(app: FastifyInstance) {
  app.post(
    "/learning/quests/:worldSlug/start",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { worldSlug } = paramsSchema.parse(request.params);
      const { learnerId } = bodySchema.parse(request.body);
      const service = new QuestService(app);
      const result = await service.startQuest(worldSlug, learnerId);
      return reply.status(201).send(result);
    },
  );
}
