import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SelService } from "../../services/sel.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const querySchema = z.object({ limit: z.coerce.number().int().positive().default(30) });

export async function selHistoryRoute(app: FastifyInstance) {
  app.get("/engagement/sel/:learnerId/history", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const { limit } = querySchema.parse(request.query);
    const service = new SelService(app);
    const history = await service.getHistory(learnerId, limit);
    return reply.send({ history });
  });
}
