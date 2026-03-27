import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { StreakService } from "../../services/streak.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function streakFreezeRoute(app: FastifyInstance) {
  app.post("/engagement/streaks/:learnerId/freeze", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new StreakService(app);
    const result = await service.useStreakFreeze(learnerId);
    if (!result.success) {
      return reply.status(400).send({ error: result.error });
    }
    return reply.send(result);
  });
}
