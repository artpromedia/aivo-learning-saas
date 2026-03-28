import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { AttributionService } from "../../services/attribution.service.js";

export async function marketingAnalyticsRoute(app: FastifyInstance) {
  app.get(
    "/admin/analytics/marketing",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { days } = request.query as { days?: string };
      const daysBack = parseInt(days ?? "30", 10);

      const service = new AttributionService(app);
      const analytics = await service.getMarketingAnalytics(daysBack);

      return reply.send(analytics);
    },
  );
}
