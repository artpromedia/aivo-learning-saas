import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService, type SubscriptionWithItems } from "../../services/subscription.service.js";
import { getPlanById } from "../../data/plans.js";

export async function currentSubscriptionRoute(app: FastifyInstance) {
  // GET /billing/current — returns formatted subscription data for JWT's tenant
  app.get("/billing/current", { preHandler: [authenticate] }, async (request, reply) => {
    const subscriptionService = new SubscriptionService(app);
    const subscription = await subscriptionService.getSubscription(request.user.tenantId) as SubscriptionWithItems | null;

    if (!subscription) {
      return reply.status(200).send({ subscription: null });
    }

    const plan = getPlanById(subscription.planId);

    return reply.status(200).send({
      plan: plan
        ? { id: plan.id, name: plan.name, price: plan.price, interval: plan.interval, maxLearners: plan.maxLearners }
        : { id: subscription.planId, name: subscription.planId, price: 0, interval: "month", maxLearners: 1 },
      status: subscription.status?.toLowerCase() ?? "active",
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? new Date().toISOString(),
      cancelAtPeriodEnd: subscription.status === "GRACE_PERIOD",
      addOns: subscription.items
        .filter((item) => item.sku !== subscription.planId)
        .map((item) => ({
          id: item.sku,
          name: item.sku,
          price: 0,
          active: item.status === "ACTIVE",
        })),
      paymentMethod: null,
      invoices: [],
    });
  });

  // GET /billing/subscriptions/current — alias for /billing/current (used by cancel page)
  app.get("/billing/subscriptions/current", { preHandler: [authenticate] }, async (request, reply) => {
    const subscriptionService = new SubscriptionService(app);
    const subscription = await subscriptionService.getSubscription(request.user.tenantId) as SubscriptionWithItems | null;

    if (!subscription) {
      return reply.status(404).send({ error: "Subscription not found" });
    }

    return reply.status(200).send({
      id: subscription.id,
      tenantId: subscription.tenantId,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
      cancelAtPeriodEnd: subscription.status === "GRACE_PERIOD",
    });
  });

  // GET /billing/subscription/status — lightweight status for settings page
  app.get("/billing/subscription/status", { preHandler: [authenticate] }, async (request, reply) => {
    const subscriptionService = new SubscriptionService(app);
    const subscription = await subscriptionService.getSubscription(request.user.tenantId) as SubscriptionWithItems | null;

    if (!subscription) {
      return reply.status(404).send({ error: "No subscription found" });
    }

    return reply.status(200).send({
      subscriptionId: subscription.id,
      status: subscription.status,
      gracePeriodEndsAt: subscription.gracePeriodEndsAt?.toISOString() ?? null,
    });
  });
}
