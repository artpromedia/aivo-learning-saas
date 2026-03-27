import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { BadgeService } from "../../services/badge.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function earnedBadgesRoute(app: FastifyInstance) {
  app.get("/engagement/badges/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new BadgeService(app);
    const badges = await service.getEarnedBadges(learnerId);
    return reply.send({ badges });
  });
}
