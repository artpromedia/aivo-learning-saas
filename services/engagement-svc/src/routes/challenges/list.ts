import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ChallengeService } from "../../services/challenge.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function listChallengesRoute(app: FastifyInstance) {
  app.get("/engagement/challenges/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new ChallengeService(app);
    const challenges = await service.getActiveChallenges(learnerId);
    return reply.send({ challenges });
  });
}
