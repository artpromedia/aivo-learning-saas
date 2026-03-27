import type { FastifyInstance } from "fastify";
import type Stripe from "stripe";

export class StripeService {
  private stripe: Stripe | null;

  constructor(private app: FastifyInstance) {
    this.stripe = app.stripe;
  }

  async createCheckoutSession(
    tenantId: string,
    planId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    if (!this.stripe) {
      const fakeUrl = `http://localhost:3000/checkout/success?session_id=fake_sess_${tenantId}_${planId}`;
      console.log(`[stripe-stub] createCheckoutSession tenantId=${tenantId} planId=${planId} → ${fakeUrl}`);
      return fakeUrl;
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { tenantId, planId },
      subscription_data: {
        metadata: { tenantId, planId },
      },
    });

    return session.url!;
  }

  async createSubscriptionItem(
    subscriptionId: string,
    priceId: string,
  ): Promise<Stripe.SubscriptionItem> {
    if (!this.stripe) {
      const fake = {
        id: `si_fake_${Date.now()}`,
        object: "subscription_item" as const,
        subscription: subscriptionId,
        price: { id: priceId },
      } as unknown as Stripe.SubscriptionItem;
      console.log(`[stripe-stub] createSubscriptionItem sub=${subscriptionId} price=${priceId} → ${fake.id}`);
      return fake;
    }

    return this.stripe.subscriptionItems.create({
      subscription: subscriptionId,
      price: priceId,
    });
  }

  async cancelSubscriptionItem(subscriptionItemId: string): Promise<void> {
    if (!this.stripe) {
      console.log(`[stripe-stub] cancelSubscriptionItem itemId=${subscriptionItemId}`);
      return;
    }

    await this.stripe.subscriptionItems.del(subscriptionItemId);
  }

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    if (!this.stripe) {
      const fakeUrl = `http://localhost:3000/billing?customer=${customerId}`;
      console.log(`[stripe-stub] createBillingPortalSession customer=${customerId} → ${fakeUrl}`);
      return fakeUrl;
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  async createInvoice(
    customerId: string,
    items: Array<{ priceId: string; quantity: number }>,
  ): Promise<Stripe.Invoice> {
    if (!this.stripe) {
      const fake = {
        id: `inv_fake_${Date.now()}`,
        object: "invoice" as const,
        customer: customerId,
        status: "draft",
        hosted_invoice_url: `http://localhost:3000/invoices/fake_${Date.now()}`,
        invoice_pdf: null,
      } as unknown as Stripe.Invoice;
      console.log(`[stripe-stub] createInvoice customer=${customerId} items=${items.length} → ${fake.id}`);
      return fake;
    }

    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      auto_advance: false,
    });

    for (const item of items) {
      await this.stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        price: item.priceId,
        quantity: item.quantity,
      });
    }

    return this.stripe.invoices.finalizeInvoice(invoice.id);
  }

  async listInvoices(customerId: string, limit = 20): Promise<Stripe.Invoice[]> {
    if (!this.stripe) {
      console.log(`[stripe-stub] listInvoices customer=${customerId}`);
      return [];
    }

    const result = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return result.data;
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    if (!this.stripe) {
      console.log(`[stripe-stub] getInvoice invoiceId=${invoiceId}`);
      return null;
    }

    return this.stripe.invoices.retrieve(invoiceId);
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    if (!this.stripe) {
      console.log(`[stripe-stub] cancelSubscription subId=${stripeSubscriptionId}`);
      return;
    }

    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }
}
