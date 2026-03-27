import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { InsightService } from "../../services/insight.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function listInsightsRoute(app: FastifyInstance) {
  app.get(
    "/family/insights/:learnerId",
    { preHandler: [authenticate, requireLearnerAccess("parent", "teacher")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new InsightService(app);
      const insights = await service.getInsights(learnerId);
      return reply.send({ insights });
    },
  );
}
