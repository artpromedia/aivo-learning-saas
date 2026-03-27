import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";

export async function cancelSubscriptionRoute(app: FastifyInstance) {
  app.post("/billing/subscriptions/:id/cancel", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const subscriptionService = new SubscriptionService(app);

    await subscriptionService.cancelSubscription(id);

    return reply.status(200).send({
      message: "Subscription cancelled. You have a 30-day grace period to reactivate.",
    });
  });
}
