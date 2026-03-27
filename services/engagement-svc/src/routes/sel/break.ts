import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SelService } from "../../services/sel.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  activityType: z.enum(["breathing", "stretch", "mindfulness", "fidget"]),
});

export async function selBreakRoute(app: FastifyInstance) {
  app.post("/engagement/sel/break", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId, activityType } = bodySchema.parse(request.body);
    const service = new SelService(app);
    const result = await service.startBreak(learnerId, activityType);
    return reply.send(result);
  });
}
