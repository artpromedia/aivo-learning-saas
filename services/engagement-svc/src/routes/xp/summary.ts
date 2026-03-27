import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { XpService } from "../../services/xp.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function xpSummaryRoute(app: FastifyInstance) {
  app.get("/engagement/xp/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new XpService(app);
    const summary = await service.getSummary(learnerId);
    return reply.send(summary);
  });
}
