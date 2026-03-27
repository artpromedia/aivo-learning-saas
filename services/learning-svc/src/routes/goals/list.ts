import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { GoalService } from "../../services/goal.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
});

export async function listGoalsRoute(app: FastifyInstance) {
  app.get(
    "/learning/goals/:learnerId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new GoalService(app);
      const goals = await service.listGoals(learnerId);
      return reply.send({ goals });
    },
  );
}
