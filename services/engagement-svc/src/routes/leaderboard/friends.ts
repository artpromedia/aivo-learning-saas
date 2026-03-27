import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { LeaderboardService } from "../../services/leaderboard.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function friendsLeaderboardRoute(app: FastifyInstance) {
  app.get("/engagement/leaderboard/friends/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new LeaderboardService(app);
    const entries = await service.getFriends(learnerId);
    return reply.send({ entries });
  });
}
