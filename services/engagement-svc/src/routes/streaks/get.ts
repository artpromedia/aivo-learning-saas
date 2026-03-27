import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { StreakService } from "../../services/streak.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function getStreakRoute(app: FastifyInstance) {
  app.get("/engagement/streaks/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new StreakService(app);
    const streak = await service.getStreak(learnerId);
    return reply.send(streak);
  });
}
