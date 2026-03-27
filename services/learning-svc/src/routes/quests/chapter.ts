import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { QuestChapterService } from "../../services/quest-chapter.service.js";

const paramsSchema = z.object({
  questId: z.string().uuid(),
  num: z.coerce.number().int().positive(),
});

const querySchema = z.object({
  learnerId: z.string().uuid(),
});

export async function questChapterRoute(app: FastifyInstance) {
  app.get(
    "/learning/quests/:questId/chapters/:num",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { questId, num } = paramsSchema.parse(request.params);
      const { learnerId } = querySchema.parse(request.query);
      const service = new QuestChapterService(app);
      const chapter = await service.getChapter(questId, num, learnerId);
      return reply.send(chapter);
    },
  );
}
