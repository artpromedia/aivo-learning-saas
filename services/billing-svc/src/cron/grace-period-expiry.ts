import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { and, eq, lt } from "drizzle-orm";
import { subscriptions, tutorSubscriptions, dataLifecycleEvents } from "@aivo/db";
import { AddonService } from "../services/addon.service.js";
import { StripeService } from "../services/stripe.service.js";
import { publishEvent } from "@aivo/events";

export function setupGracePeriodExpiryCron(app: FastifyInstance): cron.ScheduledTask {
  // Hourly — check for expired grace periods
  const task = cron.schedule("0 * * * *", async () => {
    app.log.info("Starting grace period expiry cron");

    const now = new Date();
    const stripeService = new StripeService(app);
    const addonService = new AddonService(app);

    try {
      // Check subscription grace periods
      const expiredSubs = await app.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "GRACE_PERIOD"),
            lt(subscriptions.gracePeriodEndsAt, now),
          ),
        );

      for (const sub of expiredSubs) {
        try {
          // Cancel on Stripe
          if (sub.stripeSubscriptionId) {
            await stripeService.cancelSubscription(sub.stripeSubscriptionId);
          }

          // Mark as expired
          await app.db
            .update(subscriptions)
            .set({ status: "EXPIRED", updatedAt: now })
            .where(eq(subscriptions.id, sub.id));

          // Trigger data deletion via brain-svc
          await publishEvent(app.nats, "billing.subscription.grace.expired", {
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
          });

          // Log lifecycle event
          await app.db.insert(dataLifecycleEvents).values({
            learnerId: sub.tenantId,
            eventType: "DATA_DELETION_STARTED",
            metadata: {
              subscriptionId: sub.id,
              tenantId: sub.tenantId,
              reason: "grace_period_expired",
            },
          });

          app.log.info({ subscriptionId: sub.id, tenantId: sub.tenantId }, "Subscription grace period expired, data deletion triggered");
        } catch (err) {
          app.log.error({ err, subscriptionId: sub.id }, "Failed to expire subscription");
        }
      }

      // Check addon grace periods
      const expiredAddons = await app.db
        .select()
        .from(tutorSubscriptions)
        .where(
          and(
            eq(tutorSubscriptions.status, "GRACE_PERIOD"),
            lt(tutorSubscriptions.gracePeriodEndsAt, now),
          ),
        );

      for (const addon of expiredAddons) {
        try {
          await addonService.handleGraceExpiry(addon.id);
          app.log.info({ addonId: addon.id, learnerId: addon.learnerId }, "Addon grace period expired");
        } catch (err) {
          app.log.error({ err, addonId: addon.id }, "Failed to expire addon");
        }
      }

      app.log.info(
        { expiredSubs: expiredSubs.length, expiredAddons: expiredAddons.length },
        "Grace period expiry cron completed",
      );
    } catch (err) {
      app.log.error({ err }, "Grace period expiry cron failed");
    }
  });

  app.log.info("Grace period expiry cron scheduled (hourly)");
  return task;
}
