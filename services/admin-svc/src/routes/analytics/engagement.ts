import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { AnalyticsService } from "../../services/analytics.service.js";

export async function analyticsEngagementRoute(app: FastifyInstance) {
  app.get(
    "/admin/analytics/engagement",
    { preHandler: [authenticate, adminOnly] },
    async (_request, reply) => {
      const service = new AnalyticsService(app);
      const data = await service.getEngagementAnalytics();
      return reply.send(data);
    },
  );
}
