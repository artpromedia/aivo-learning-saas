import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { LeaderboardService } from "../../services/leaderboard.service.js";

const querySchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export async function globalLeaderboardRoute(app: FastifyInstance) {
  app.get("/engagement/leaderboard/global", { preHandler: [authenticate] }, async (request, reply) => {
    const { limit, offset } = querySchema.parse(request.query);
    const service = new LeaderboardService(app);
    const entries = await service.getGlobal(limit, offset);
    return reply.send({ entries });
  });
}
