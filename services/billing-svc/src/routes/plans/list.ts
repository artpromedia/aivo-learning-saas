import type { FastifyInstance } from "fastify";
import { PlanService } from "../../services/plan.service.js";

export async function listPlansRoute(app: FastifyInstance) {
  app.get("/billing/plans", async (_request, reply) => {
    const planService = new PlanService(app);
    const plans = planService.listPlans();

    return reply.status(200).send({ plans });
  });
}
