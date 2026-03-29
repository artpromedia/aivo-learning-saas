import type { FastifyInstance } from "fastify";
import type Stripe from "stripe";
import { subscriptions, tenants } from "@aivo/db";
import { eq } from "drizzle-orm";
import { StripeService } from "./stripe.service.js";

export class InvoiceService {
  private stripeService: StripeService;

  constructor(private app: FastifyInstance) {
    this.stripeService = new StripeService(app);
  }

  /**
   * List invoices for a tenant by looking up their Stripe customer ID
   * from the subscription record.
   */
  async listInvoices(tenantId: string): Promise<Stripe.Invoice[]> {
    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId));

    if (!sub || !sub.stripeSubscriptionId) {
      this.app.log.info(`No subscription found for tenant=${tenantId}, returning empty invoices`);
      return [];
    }

    // Retrieve the Stripe subscription to get the customer ID
    if (!this.app.stripe) {
      console.log(`[stripe-dev] listInvoices for tenant=${tenantId}`);
      return [];
    }

    const stripeSub = await this.app.stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const customerId = stripeSub.customer as string;

    return this.stripeService.listInvoices(customerId);
  }

  /**
   * Get the hosted invoice URL for a given invoice, allowing the customer
   * to view and download it.
   */
  async getInvoiceDownloadUrl(invoiceId: string): Promise<string | null> {
    const invoice = await this.stripeService.getInvoice(invoiceId);

    if (!invoice) {
      this.app.log.warn(`Invoice ${invoiceId} not found`);
      return null;
    }

    return invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null;
  }
}
