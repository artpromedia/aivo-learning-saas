import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { InsightService } from "../../services/insight.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({ text: z.string().min(1).max(4096) });

export async function submitInsightRoute(app: FastifyInstance) {
  app.post(
    "/family/insights/:learnerId",
    { preHandler: [authenticate, requireLearnerAccess("parent", "teacher", "caregiver")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { text } = bodySchema.parse(request.body);
      const attribution = request.learnerAccess!.role;
      const service = new InsightService(app);
      const insight = await service.submitInsight(learnerId, request.user.sub, text, attribution);
      return reply.status(201).send(insight);
    },
  );
}
