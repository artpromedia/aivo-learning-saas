import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ChallengeService } from "../../services/challenge.service.js";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function challengeResultRoute(app: FastifyInstance) {
  app.get("/engagement/challenges/:id/result", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    const service = new ChallengeService(app);
    const result = await service.getResult(id);
    if (!result) {
      return reply.status(404).send({ error: "Challenge not found" });
    }
    return reply.send(result);
  });
}
