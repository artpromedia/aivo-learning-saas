import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { LeaderboardService } from "../../services/leaderboard.service.js";

const paramsSchema = z.object({ classroomId: z.string().min(1) });
const querySchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export async function classroomLeaderboardRoute(app: FastifyInstance) {
  app.get("/engagement/leaderboard/classroom/:classroomId", { preHandler: [authenticate] }, async (request, reply) => {
    const { classroomId } = paramsSchema.parse(request.params);
    const { limit, offset } = querySchema.parse(request.query);
    const service = new LeaderboardService(app);
    const entries = await service.getClassroom(classroomId, limit, offset);
    return reply.send({ entries });
  });
}
