import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { BossAssessmentService } from "../../services/boss-assessment.service.js";

const paramsSchema = z.object({
  questId: z.string().uuid(),
});

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.string(),
        correct: z.boolean(),
      }),
    )
    .optional(),
});

export async function bossAssessmentRoute(app: FastifyInstance) {
  app.post(
    "/learning/quests/:questId/boss",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { questId } = paramsSchema.parse(request.params);
      const body = bodySchema.parse(request.body);
      const service = new BossAssessmentService(app);

      if (body.answers) {
        // Submit boss answers
        const result = await service.submitBossResult(questId, body.learnerId, body.answers);
        return reply.send(result);
      }

      // Generate boss assessment
      const assessment = await service.generateBossAssessment(questId, body.learnerId);
      return reply.send(assessment);
    },
  );
}
