import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { GoalService } from "../../services/goal.service.js";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["active", "completed", "paused"]).optional(),
  targetMastery: z.number().min(0).max(1).optional(),
  dueDate: z.string().optional(),
});

export async function updateGoalRoute(app: FastifyInstance) {
  app.patch(
    "/learning/goals/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const body = bodySchema.parse(request.body);
      const { learnerId, ...updates } = body;
      const service = new GoalService(app);
      const goal = await service.updateGoal(id, learnerId, updates);
      if (!goal) {
        return reply.status(404).send({ error: "Goal not found" });
      }
      return reply.send({ goal });
    },
  );
}
