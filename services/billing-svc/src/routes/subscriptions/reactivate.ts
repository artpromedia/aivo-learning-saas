import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";

export async function reactivateSubscriptionRoute(app: FastifyInstance) {
  app.post("/billing/subscriptions/:id/reactivate", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const subscriptionService = new SubscriptionService(app);

    await subscriptionService.reactivateSubscription(id);

    return reply.status(200).send({
      message: "Subscription reactivated successfully.",
    });
  });
}
