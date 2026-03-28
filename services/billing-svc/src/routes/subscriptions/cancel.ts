import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";
import { publishEvent } from "@aivo/events";

export async function cancelSubscriptionRoute(app: FastifyInstance) {
  app.post("/billing/subscriptions/:id/cancel", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const subscriptionService = new SubscriptionService(app);

    const sub = await subscriptionService.cancelSubscription(id);

    await publishEvent(app.nats, "billing.subscription.grace.started", {
      tenantId: sub.tenantId,
      subscriptionId: sub.id,
      gracePeriodEndsAt: sub.gracePeriodEndsAt?.toISOString(),
    });

    return reply.status(200).send({
      message: "Subscription cancelled. You have a 30-day grace period to reactivate.",
      gracePeriodEndsAt: sub.gracePeriodEndsAt?.toISOString(),
    });
  });
}
