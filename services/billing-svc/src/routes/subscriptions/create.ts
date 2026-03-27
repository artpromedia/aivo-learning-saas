import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";

const createSubscriptionBodySchema = z.object({
  planId: z.string().min(1),
});

export async function createSubscriptionRoute(app: FastifyInstance) {
  app.post("/billing/subscriptions", { preHandler: [authenticate] }, async (request, reply) => {
    const body = createSubscriptionBodySchema.parse(request.body);
    const subscriptionService = new SubscriptionService(app);

    const checkoutUrl = await subscriptionService.createSubscription(
      request.user.tenantId,
      body.planId,
    );

    return reply.status(200).send({ checkoutUrl });
  });
}
