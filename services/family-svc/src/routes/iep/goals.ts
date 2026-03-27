import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { IepService } from "../../services/iep.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function iepGoalsRoute(app: FastifyInstance) {
  app.get(
    "/family/iep/:learnerId/goals",
    { preHandler: [authenticate, requireLearnerAccess("parent", "teacher")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new IepService(app);
      const goals = await service.getGoals(learnerId);
      return reply.send({ goals });
    },
  );
}
