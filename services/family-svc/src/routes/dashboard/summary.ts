import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { DashboardService } from "../../services/dashboard.service.js";

export async function dashboardSummaryRoute(app: FastifyInstance) {
  app.get(
    "/family/dashboard/summary",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const service = new DashboardService(app);
      const summary = await service.getSummary(request.user.sub);
      return reply.send(summary);
    },
  );
}
