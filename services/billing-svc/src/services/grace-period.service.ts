import type { FastifyInstance } from "fastify";
import { subscriptions, tutorSubscriptions } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { eq, and, lt } from "drizzle-orm";
import { AddonService } from "./addon.service.js";
import { StripeService } from "./stripe.service.js";

export class GracePeriodService {
  private addonService: AddonService;
  private stripeService: StripeService;

  constructor(private app: FastifyInstance) {
    this.addonService = new AddonService(app);
    this.stripeService = new StripeService(app);
  }

  /**
   * Find subscriptions where gracePeriodEndsAt < now AND status is GRACE_PERIOD,
   * mark them as CANCELLED, cancel Stripe subscription, and publish events.
   */
  async checkAndExpireSubscriptions(): Promise<number> {
    const now = new Date();

    const expiredSubs = await this.app.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "GRACE_PERIOD"),
          lt(subscriptions.gracePeriodEndsAt, now),
        ),
      );

    if (expiredSubs.length === 0) {
      this.app.log.info("No subscriptions to expire");
      return 0;
    }

    for (const sub of expiredSubs) {
      try {
        // Cancel the Stripe subscription
        if (sub.stripeSubscriptionId) {
          await this.stripeService.cancelSubscription(sub.stripeSubscriptionId);
        }

        // Update status to CANCELLED
        await this.app.db
          .update(subscriptions)
          .set({
            status: "CANCELLED",
            updatedAt: now,
          })
          .where(eq(subscriptions.id, sub.id));

        // Publish cancellation event
        await publishEvent(this.app.nats, "billing.subscription.cancelled", {
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          reason: "grace_period_expired",
        });

        this.app.log.info(`Subscription ${sub.id} expired after grace period for tenant=${sub.tenantId}`);
      } catch (err) {
        this.app.log.error(`Failed to expire subscription ${sub.id}: ${(err as Error).message}`);
      }
    }

    return expiredSubs.length;
  }

  /**
   * Find tutor_subscriptions where gracePeriodEndsAt < now AND status is GRACE_PERIOD,
   * then call handleGraceExpiry for each.
   */
  async checkAndExpireAddons(): Promise<number> {
    const now = new Date();

    const expiredAddons = await this.app.db
      .select()
      .from(tutorSubscriptions)
      .where(
        and(
          eq(tutorSubscriptions.status, "GRACE_PERIOD"),
          lt(tutorSubscriptions.gracePeriodEndsAt, now),
        ),
      );

    if (expiredAddons.length === 0) {
      this.app.log.info("No addons to expire");
      return 0;
    }

    for (const addon of expiredAddons) {
      try {
        await this.addonService.handleGraceExpiry(addon.id);
      } catch (err) {
        this.app.log.error(`Failed to expire addon ${addon.id}: ${(err as Error).message}`);
      }
    }

    return expiredAddons.length;
  }
}
