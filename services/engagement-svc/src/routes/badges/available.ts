import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { BadgeService } from "../../services/badge.service.js";

export async function availableBadgesRoute(app: FastifyInstance) {
  app.get("/engagement/badges/available", { preHandler: [authenticate] }, async (_request, reply) => {
    const service = new BadgeService(app);
    const badges = await service.getAvailableBadges();
    return reply.send({ badges });
  });
}
