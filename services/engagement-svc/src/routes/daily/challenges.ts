import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { DailyChallengeService } from "../../services/daily-challenge.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function dailyChallengesRoute(app: FastifyInstance) {
  app.get("/engagement/daily/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new DailyChallengeService(app);
    const challenges = await service.getDailyChallenges(learnerId);
    return reply.send({ challenges });
  });
}
