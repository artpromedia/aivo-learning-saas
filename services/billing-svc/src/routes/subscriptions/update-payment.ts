import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";
import { StripeService } from "../../services/stripe.service.js";
import { getConfig } from "../../config.js";

export async function updatePaymentRoute(app: FastifyInstance) {
  app.post("/billing/subscriptions/:id/update-payment", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const config = getConfig();
    const subscriptionService = new SubscriptionService(app);
    const stripeService = new StripeService(app);

    const subscription = await subscriptionService.getSubscription(request.user.tenantId);

    if (!subscription) {
      return reply.status(404).send({ error: "Subscription not found" });
    }

    const returnUrl = `${config.APP_URL}/billing`;
    const portalUrl = await stripeService.createBillingPortalSession(
      subscription.stripeSubscriptionId ?? request.user.tenantId,
      returnUrl,
    );

    return reply.status(200).send({ portalUrl });
  });
}
