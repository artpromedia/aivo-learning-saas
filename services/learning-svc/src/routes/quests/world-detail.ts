import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { QuestService } from "../../services/quest.service.js";

const paramsSchema = z.object({
  worldSlug: z.string().min(1),
});

const querySchema = z.object({
  learnerId: z.string().uuid(),
});

export async function questWorldDetailRoute(app: FastifyInstance) {
  app.get(
    "/learning/quests/worlds/:worldSlug",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { worldSlug } = paramsSchema.parse(request.params);
      const { learnerId } = querySchema.parse(request.query);
      const service = new QuestService(app);
      const detail = await service.getWorldDetail(worldSlug, learnerId);
      if (!detail) {
        return reply.status(404).send({ error: "Quest world not found" });
      }
      return reply.send(detail);
    },
  );
}
