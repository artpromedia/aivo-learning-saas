import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { DashboardService } from "../../services/dashboard.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function dashboardOverviewRoute(app: FastifyInstance) {
  app.get(
    "/family/dashboard/:learnerId",
    { preHandler: [authenticate, requireLearnerAccess("parent", "teacher", "caregiver")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new DashboardService(app);
      const overview = await service.getOverview(learnerId);
      return reply.send(overview);
    },
  );
}
