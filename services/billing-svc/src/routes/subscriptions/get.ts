import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";

export async function getSubscriptionRoute(app: FastifyInstance) {
  app.get("/billing/subscriptions/:tenantId", { preHandler: [authenticate] }, async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const subscriptionService = new SubscriptionService(app);

    const subscription = await subscriptionService.getSubscription(tenantId);

    if (!subscription) {
      return reply.status(404).send({ error: "Subscription not found" });
    }

    return reply.status(200).send({ subscription });
  });
}
