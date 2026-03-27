import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ChallengeService } from "../../services/challenge.service.js";

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z.object({
  learnerId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    timeMs: z.number().int().nonnegative(),
  })),
});

export async function playChallengeRoute(app: FastifyInstance) {
  app.post("/engagement/challenges/:id/play", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    const { learnerId, answers } = bodySchema.parse(request.body);
    const service = new ChallengeService(app);
    const result = await service.submitAnswers(id, learnerId, answers);
    return reply.send(result);
  });
}
