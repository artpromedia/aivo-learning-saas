import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { AnalyticsService } from "../../services/analytics.service.js";

export async function analyticsLearnersRoute(app: FastifyInstance) {
  app.get(
    "/admin/analytics/learners",
    { preHandler: [authenticate, adminOnly] },
    async (_request, reply) => {
      const service = new AnalyticsService(app);
      const data = await service.getLearnerAnalytics();
      return reply.send(data);
    },
  );
}
