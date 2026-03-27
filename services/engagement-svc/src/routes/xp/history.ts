import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { XpService } from "../../services/xp.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const querySchema = z.object({
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export async function xpHistoryRoute(app: FastifyInstance) {
  app.get("/engagement/xp/:learnerId/history", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const { limit, offset } = querySchema.parse(request.query);
    const service = new XpService(app);
    const history = await service.getHistory(learnerId, limit, offset);
    return reply.send({ history });
  });
}
