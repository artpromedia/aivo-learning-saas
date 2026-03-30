import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { PlanService } from "../../services/plan.service.js";

export async function listPlansRoute(app: FastifyInstance) {
  app.get("/billing/plans", { preHandler: [authenticate, authorize("PARENT", "PLATFORM_ADMIN")] }, async (_request, reply) => {
    const planService = new PlanService(app);
    const plans = planService.listPlans();

    return reply.status(200).send({ plans });
  });
}
