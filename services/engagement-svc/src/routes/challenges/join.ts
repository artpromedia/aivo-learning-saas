import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ChallengeService } from "../../services/challenge.service.js";

const paramsSchema = z.object({ id: z.string().min(1) });
const bodySchema = z.object({
  learnerId: z.string().uuid(),
  learnerName: z.string().min(1),
});

export async function joinChallengeRoute(app: FastifyInstance) {
  app.post("/engagement/challenges/:id/join", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    const { learnerId, learnerName } = bodySchema.parse(request.body);
    const service = new ChallengeService(app);
    const challenge = await service.joinChallenge(id, learnerId, learnerName);
    return reply.send(challenge);
  });
}
