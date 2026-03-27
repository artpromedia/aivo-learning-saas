import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { GoalService } from "../../services/goal.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  targetSubject: z.string().min(1),
  targetSkill: z.string().optional(),
  targetMastery: z.number().min(0).max(1),
  dueDate: z.string().optional(),
});

export async function createGoalRoute(app: FastifyInstance) {
  app.post(
    "/learning/goals",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = bodySchema.parse(request.body);
      const service = new GoalService(app);
      const goal = await service.createGoal({
        ...body,
        createdBy: request.user.sub,
      });
      return reply.status(201).send({ goal });
    },
  );
}
