import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { InsightService } from "../../services/insight.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function teacherInsightsRoute(app: FastifyInstance) {
  app.get(
    "/family/collaboration/:learnerId/teacher-insights",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new InsightService(app);
      const insights = await service.getInsights(learnerId);
      const teacherInsights = insights.filter((i) => i.attribution === "teacher");
      return reply.send({ insights: teacherInsights });
    },
  );
}
