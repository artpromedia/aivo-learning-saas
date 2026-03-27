import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { AnalyticsService } from "../../services/analytics.service.js";

export async function analyticsOverviewRoute(app: FastifyInstance) {
  app.get(
    "/admin/analytics/overview",
    { preHandler: [authenticate, adminOnly] },
    async (_request, reply) => {
      const service = new AnalyticsService(app);
      const overview = await service.getOverview();
      return reply.send(overview);
    },
  );
}
