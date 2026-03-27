import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { QuestChapterService } from "../../services/quest-chapter.service.js";

const paramsSchema = z.object({
  questId: z.string().uuid(),
  num: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  learnerId: z.string().uuid(),
});

export async function chapterCompleteRoute(app: FastifyInstance) {
  app.post(
    "/learning/quests/:questId/chapters/:num/complete",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { questId, num } = paramsSchema.parse(request.params);
      const { learnerId } = bodySchema.parse(request.body);
      const service = new QuestChapterService(app);
      const result = await service.completeChapter(questId, num, learnerId);
      return reply.send(result);
    },
  );
}
