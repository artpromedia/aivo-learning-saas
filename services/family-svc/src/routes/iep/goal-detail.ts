import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { IepService } from "../../services/iep.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
  goalId: z.string().uuid(),
});

export async function iepGoalDetailRoute(app: FastifyInstance) {
  app.get(
    "/family/iep/:learnerId/goals/:goalId",
    { preHandler: [authenticate, requireLearnerAccess("parent", "teacher")] },
    async (request, reply) => {
      const { learnerId, goalId } = paramsSchema.parse(request.params);
      const service = new IepService(app);
      const goal = await service.getGoalDetail(learnerId, goalId);
      return reply.send(goal);
    },
  );
}
