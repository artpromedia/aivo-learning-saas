import type { FastifyInstance } from "fastify";
import type Stripe from "stripe";
import { subscriptions, subscriptionItems, tenants } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { eq, and } from "drizzle-orm";
import { getPlanById } from "../data/plans.js";
import { getConfig } from "../config.js";
import { StripeService } from "./stripe.service.js";

export interface SubscriptionRow {
  id: string;
  tenantId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELLED" | "GRACE_PERIOD" | "EXPIRED" | "SUSPENDED";
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelledAt: Date | null;
  gracePeriodEndsAt: Date | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionItemRow {
  id: string;
  subscriptionId: string;
  sku: string;
  stripeSubscriptionItemId: string | null;
  quantity: number;
  status: string;
  createdAt: Date;
}

export type SubscriptionWithItems = SubscriptionRow & { items: SubscriptionItemRow[] };

export class SubscriptionService {
  private stripeService: StripeService;

  constructor(private app: FastifyInstance) {
    this.stripeService = new StripeService(app);
  }

  async createSubscription(tenantId: string, planId: string): Promise<string> {
    const plan = getPlanById(planId);
    if (!plan) {
      throw new Error(`Unknown plan: ${planId}`);
    }
    if (plan.contactSales) {
      throw new Error(`Plan ${planId} requires contacting sales`);
    }

    const config = getConfig();
    const successUrl = `${config.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${config.APP_URL}/billing/cancel`;

    const checkoutUrl = await this.stripeService.createCheckoutSession(
      tenantId,
      planId,
      plan.stripePriceId,
      successUrl,
      cancelUrl,
      plan.trialDays,
    );

    return checkoutUrl;
  }

  async handleCheckoutCompleted(stripeEvent: Stripe.CheckoutSessionCompletedEvent): Promise<void> {
    const session = stripeEvent.data.object;
    const tenantId = session.metadata?.tenantId;
    const planId = session.metadata?.planId;

    if (!tenantId || !planId) {
      this.app.log.error("Checkout session missing tenantId or planId metadata");
      return;
    }

    const plan = getPlanById(planId);
    if (!plan) {
      this.app.log.error(`Unknown plan in checkout: ${planId}`);
      return;
    }

    const stripeSubscriptionId = session.subscription as string;
    const now = new Date();

    // Determine if this is a trial subscription
    const isTrial = plan.trialDays > 0;
    const trialEndsAt = isTrial
      ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      : null;

    // Create the subscription record
    const [sub] = await this.app.db
      .insert(subscriptions)
      .values({
        tenantId,
        planId,
        stripeSubscriptionId,
        status: isTrial ? "TRIALING" : "ACTIVE",
        trialEndsAt,
        currentPeriodStart: now,
        currentPeriodEnd: isTrial
          ? trialEndsAt
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Create subscription item record for the base plan
    await this.app.db.insert(subscriptionItems).values({
      subscriptionId: sub.id,
      sku: planId,
      stripeSubscriptionItemId: stripeSubscriptionId,
      quantity: 1,
      status: isTrial ? "TRIALING" : "ACTIVE",
      createdAt: now,
    });

    // Update tenant's planId
    await this.app.db
      .update(tenants)
      .set({ planId, updatedAt: now })
      .where(eq(tenants.id, tenantId));

    // Publish event with trial info
    await publishEvent(this.app.nats, "billing.subscription.created", {
      tenantId,
      planId,
      subscriptionId: sub.id,
      stripeSubscriptionId,
      isTrial,
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
    });

    this.app.log.info(`Subscription created for tenant=${tenantId} plan=${planId} sub=${sub.id} trial=${isTrial}`);
  }

  async handleSubscriptionUpdated(stripeEvent: Stripe.CustomerSubscriptionUpdatedEvent): Promise<void> {
    const stripeSub = stripeEvent.data.object;
    const status = stripeSub.status;

    if (status === "active") {
      // Trial ended or subscription renewed — mark as ACTIVE
      await this.app.db
        .update(subscriptions)
        .set({
          status: "ACTIVE",
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id));

      this.app.log.info(`Subscription ${stripeSub.id} transitioned to ACTIVE`);
    } else if (status === "past_due") {
      await this.app.db
        .update(subscriptions)
        .set({
          status: "PAST_DUE",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id));

      this.app.log.info(`Subscription ${stripeSub.id} transitioned to PAST_DUE`);
    }
  }

  async cancelSubscription(subscriptionId: string) {
    const now = new Date();
    const gracePeriodEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    const [updated] = await this.app.db
      .update(subscriptions)
      .set({
        status: "GRACE_PERIOD",
        cancelledAt: now,
        gracePeriodEndsAt,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    this.app.log.info(`Subscription ${subscriptionId} set to GRACE_PERIOD until ${gracePeriodEndsAt.toISOString()}`);
    return updated;
  }

  async reactivateSubscription(subscriptionId: string): Promise<void> {
    const now = new Date();

    // Fetch the subscription to check grace period
    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.status, "GRACE_PERIOD"),
        ),
      );

    if (!sub) {
      throw new Error(`Subscription ${subscriptionId} not found or not in grace period`);
    }

    if (sub.gracePeriodEndsAt && sub.gracePeriodEndsAt < now) {
      throw new Error(`Grace period for subscription ${subscriptionId} has expired`);
    }

    await this.app.db
      .update(subscriptions)
      .set({
        status: "ACTIVE",
        cancelledAt: null,
        gracePeriodEndsAt: null,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, subscriptionId));

    this.app.log.info(`Subscription ${subscriptionId} reactivated`);
  }

  async getSubscription(tenantId: string): Promise<SubscriptionWithItems | null> {
    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId));

    if (!sub) return null;

    const items = await this.app.db
      .select()
      .from(subscriptionItems)
      .where(eq(subscriptionItems.subscriptionId, sub.id));

    return { ...sub, items } as SubscriptionWithItems;
  }
}
