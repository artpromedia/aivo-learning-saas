import type { FastifyInstance } from "fastify";
import { subscriptions } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { eq, and, lt } from "drizzle-orm";
import { StripeService } from "./stripe.service.js";

const REDIS_DUNNING_PREFIX = "billing:dunning:";
const PAST_DUE_SUSPEND_DAYS = 14;

export class DunningService {
  private stripeService: StripeService;

  constructor(private app: FastifyInstance) {
    this.stripeService = new StripeService(app);
  }

  /**
   * Handle a payment failure: increment retry count in Redis and publish event.
   */
  async handlePaymentFailure(
    tenantId: string,
    invoiceId: string,
    retryAt: Date | null,
  ): Promise<void> {
    const redisKey = `${REDIS_DUNNING_PREFIX}${tenantId}`;

    // Increment retry count
    const retryCount = await this.app.redis.incr(redisKey);
    // Set TTL of 30 days on the key if it's the first failure
    if (retryCount === 1) {
      await this.app.redis.expire(redisKey, 30 * 24 * 60 * 60);
    }

    await publishEvent(this.app.nats, "billing.payment.failed", {
      tenantId,
      invoiceId,
      retryAt: (retryAt ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).toISOString(),
    });

    this.app.log.info(
      `Payment failure recorded for tenant=${tenantId} invoice=${invoiceId} retryCount=${retryCount} retryAt=${retryAt?.toISOString() ?? "none"}`,
    );
  }

  /**
   * Find subscriptions that are PAST_DUE for more than 14 days and suspend them.
   */
  async checkAndSuspend(): Promise<number> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - PAST_DUE_SUSPEND_DAYS * 24 * 60 * 60 * 1000);

    // Find PAST_DUE subscriptions whose updatedAt is older than the cutoff
    // (meaning they've been PAST_DUE for longer than PAST_DUE_SUSPEND_DAYS)
    const pastDueSubs = await this.app.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "PAST_DUE"),
          lt(subscriptions.updatedAt, cutoff),
        ),
      );

    if (pastDueSubs.length === 0) {
      this.app.log.info("No PAST_DUE subscriptions to suspend");
      return 0;
    }

    for (const sub of pastDueSubs) {
      try {
        // Cancel the Stripe subscription
        if (sub.stripeSubscriptionId) {
          await this.stripeService.cancelSubscription(sub.stripeSubscriptionId);
        }

        // Mark as SUSPENDED
        await this.app.db
          .update(subscriptions)
          .set({
            status: "SUSPENDED",
            updatedAt: now,
          })
          .where(eq(subscriptions.id, sub.id));

        await publishEvent(this.app.nats, "billing.subscription.cancelled", {
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          reason: "payment_failure_suspended",
        });

        // Clean up Redis dunning counter
        await this.app.redis.del(`${REDIS_DUNNING_PREFIX}${sub.tenantId}`);

        this.app.log.info(
          `Subscription ${sub.id} suspended after ${PAST_DUE_SUSPEND_DAYS} days PAST_DUE for tenant=${sub.tenantId}`,
        );
      } catch (err) {
        this.app.log.error(`Failed to suspend subscription ${sub.id}: ${(err as Error).message}`);
      }
    }

    return pastDueSubs.length;
  }
}
