import type { FastifyInstance } from "fastify";
import type Stripe from "stripe";
import { subscriptions } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { eq } from "drizzle-orm";
import { SubscriptionService } from "./subscription.service.js";
import { DunningService } from "./dunning.service.js";

export class WebhookService {
  private subscriptionService: SubscriptionService;
  private dunningService: DunningService;

  constructor(private app: FastifyInstance) {
    this.subscriptionService = new SubscriptionService(app);
    this.dunningService = new DunningService(app);
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    this.app.log.info(`Processing Stripe webhook event: ${event.type} (${event.id})`);

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event as Stripe.CheckoutSessionCompletedEvent);
        break;

      case "invoice.paid":
        await this.handleInvoicePaid(event);
        break;

      case "invoice.payment_failed":
        await this.handleInvoicePaymentFailed(event);
        break;

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event);
        break;

      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event);
        break;

      default:
        this.app.log.info(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<void> {
    await this.subscriptionService.handleCheckoutCompleted(event);
  }

  private async handleInvoicePaid(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const stripeSubscriptionId = invoice.subscription as string | null;

    if (!stripeSubscriptionId) {
      this.app.log.info(`Invoice ${invoice.id} paid but not tied to a subscription`);
      return;
    }

    // Find the internal subscription
    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

    if (!sub) {
      this.app.log.warn(`No subscription found for stripeSubscriptionId=${stripeSubscriptionId}`);
      return;
    }

    // Update the billing period
    const now = new Date();
    await this.app.db
      .update(subscriptions)
      .set({
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: now,
      })
      .where(eq(subscriptions.id, sub.id));

    await publishEvent(this.app.nats, "billing.payment.succeeded", {
      tenantId: sub.tenantId,
      amount: invoice.amount_paid ?? 0,
      invoiceId: invoice.id ?? "",
    });

    this.app.log.info(`Invoice ${invoice.id} paid for tenant=${sub.tenantId} sub=${sub.id}`);
  }

  private async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const stripeSubscriptionId = invoice.subscription as string | null;

    if (!stripeSubscriptionId) {
      return;
    }

    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

    if (!sub) {
      this.app.log.warn(`No subscription found for stripeSubscriptionId=${stripeSubscriptionId}`);
      return;
    }

    // Mark subscription as PAST_DUE
    await this.app.db
      .update(subscriptions)
      .set({
        status: "PAST_DUE",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, sub.id));

    // Delegate to dunning service
    const nextRetry = invoice.next_payment_attempt
      ? new Date(invoice.next_payment_attempt * 1000)
      : null;

    await this.dunningService.handlePaymentFailure(
      sub.tenantId,
      invoice.id,
      nextRetry,
    );

    this.app.log.info(`Payment failed for invoice=${invoice.id} tenant=${sub.tenantId}`);
  }

  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id));

    if (!sub) {
      this.app.log.warn(`No subscription found for stripeSubscriptionId=${stripeSubscription.id}`);
      return;
    }

    const now = new Date();
    await this.app.db
      .update(subscriptions)
      .set({
        status: "CANCELLED",
        cancelledAt: now,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, sub.id));

    await publishEvent(this.app.nats, "billing.subscription.cancelled", {
      tenantId: sub.tenantId,
      subscriptionId: sub.id,
      graceEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    this.app.log.info(`Subscription ${sub.id} cancelled (Stripe deleted) for tenant=${sub.tenantId}`);
  }

  private async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id));

    if (!sub) {
      this.app.log.warn(`No subscription found for stripeSubscriptionId=${stripeSubscription.id}`);
      return;
    }

    const now = new Date();
    const periodStart = new Date(stripeSubscription.current_period_start * 1000);
    const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

    let status = sub.status;
    if (stripeSubscription.status === "active") {
      status = "ACTIVE";
    } else if (stripeSubscription.status === "past_due") {
      status = "PAST_DUE";
    } else if (stripeSubscription.status === "canceled") {
      status = "CANCELLED";
    }

    await this.app.db
      .update(subscriptions)
      .set({
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, sub.id));

    this.app.log.info(`Subscription ${sub.id} updated status=${status} for tenant=${sub.tenantId}`);
  }
}
