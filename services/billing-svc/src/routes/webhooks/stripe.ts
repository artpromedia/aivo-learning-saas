import type { FastifyInstance } from "fastify";
import { stripeVerify } from "../../middleware/stripe-verify.js";
import { SubscriptionService } from "../../services/subscription.service.js";

export async function stripeWebhookRoute(app: FastifyInstance) {
  app.post(
    "/billing/webhooks/stripe",
    {
      config: {
        rawBody: true,
      },
      preHandler: [stripeVerify],
    },
    async (request, reply) => {
      const event = request.stripeEvent;
      const subscriptionService = new SubscriptionService(app);

      app.log.info({ type: event.type }, "Stripe webhook received");

      switch (event.type) {
        case "checkout.session.completed":
          await subscriptionService.handleCheckoutCompleted(event as any);
          break;

        case "invoice.payment_succeeded":
          app.log.info({ invoiceId: (event.data.object as any).id }, "Payment succeeded");
          break;

        case "invoice.payment_failed":
          app.log.warn({ invoiceId: (event.data.object as any).id }, "Payment failed");
          break;

        case "customer.subscription.deleted":
          app.log.info({ subscriptionId: (event.data.object as any).id }, "Subscription deleted in Stripe");
          break;

        default:
          app.log.debug({ type: event.type }, "Unhandled Stripe event type");
      }

      return reply.status(200).send({ received: true });
    },
  );
}
