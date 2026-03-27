import type { FastifyInstance } from "fastify";
import type Stripe from "stripe";
import { subscriptions, subscriptionItems, tenants, users } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { eq, and, sql } from "drizzle-orm";
import { StripeService } from "./stripe.service.js";

interface ContractData {
  tenantId: string;
  planId: string;
  totalSeats: number;
  customerId: string; // Stripe customer ID
  priceId: string;
  startDate?: Date;
  endDate?: Date;
}

interface ContractUsage {
  contractId: string;
  tenantId: string;
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
}

export class B2BService {
  private stripeService: StripeService;

  constructor(private app: FastifyInstance) {
    this.stripeService = new StripeService(app);
  }

  /**
   * Create a B2B district contract: creates a subscription record,
   * subscription item for the seat count, and generates a Stripe invoice.
   */
  async createContract(data: ContractData): Promise<{ contractId: string; invoiceId: string | null }> {
    const now = new Date();
    const startDate = data.startDate ?? now;
    const endDate = data.endDate ?? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

    // Create the subscription record representing the contract
    const [contract] = await this.app.db
      .insert(subscriptions)
      .values({
        tenantId: data.tenantId,
        planId: data.planId,
        stripeSubscriptionId: "", // Will be set after Stripe invoice or can be manual
        status: "ACTIVE",
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Create subscription item for seat allocation
    await this.app.db.insert(subscriptionItems).values({
      subscriptionId: contract.id,
      sku: `SEATS_${data.planId}`,
      stripeSubscriptionItemId: "",
      quantity: data.totalSeats,
      status: "ACTIVE",
      createdAt: now,
    });

    // Update tenant's planId and type
    await this.app.db
      .update(tenants)
      .set({
        planId: data.planId,
        updatedAt: now,
      })
      .where(eq(tenants.id, data.tenantId));

    // Generate Stripe invoice for the contract
    let invoiceId: string | null = null;
    try {
      const invoice = await this.stripeService.createInvoice(data.customerId, [
        { priceId: data.priceId, quantity: data.totalSeats },
      ]);
      invoiceId = invoice.id;
    } catch (err) {
      this.app.log.error(`Failed to create Stripe invoice for contract: ${(err as Error).message}`);
    }

    await publishEvent(this.app.nats, "billing.subscription.created", {
      tenantId: data.tenantId,
      planId: data.planId,
      subscriptionId: contract.id,
      type: "b2b_contract",
      totalSeats: data.totalSeats,
    });

    this.app.log.info(
      `B2B contract created: contractId=${contract.id} tenant=${data.tenantId} seats=${data.totalSeats}`,
    );

    return { contractId: contract.id, invoiceId };
  }

  /**
   * Add seats to an existing B2B contract.
   */
  async addSeats(contractId: string, count: number): Promise<{ newTotal: number }> {
    const now = new Date();

    // Get current seat item
    const [seatItem] = await this.app.db
      .select()
      .from(subscriptionItems)
      .where(
        and(
          eq(subscriptionItems.subscriptionId, contractId),
          eq(subscriptionItems.status, "ACTIVE"),
        ),
      );

    if (!seatItem) {
      throw new Error(`No active seat item found for contract ${contractId}`);
    }

    const newTotal = seatItem.quantity + count;

    await this.app.db
      .update(subscriptionItems)
      .set({ quantity: newTotal })
      .where(eq(subscriptionItems.id, seatItem.id));

    // Update the subscription updatedAt
    await this.app.db
      .update(subscriptions)
      .set({ updatedAt: now })
      .where(eq(subscriptions.id, contractId));

    this.app.log.info(`Added ${count} seats to contract ${contractId}, newTotal=${newTotal}`);

    return { newTotal };
  }

  /**
   * Get usage data for a B2B contract: seats used vs total allocated.
   */
  async getUsage(contractId: string): Promise<ContractUsage> {
    // Get the contract
    const [contract] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, contractId));

    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    // Get the seat allocation
    const [seatItem] = await this.app.db
      .select()
      .from(subscriptionItems)
      .where(
        and(
          eq(subscriptionItems.subscriptionId, contractId),
          eq(subscriptionItems.status, "ACTIVE"),
        ),
      );

    const totalSeats = seatItem?.quantity ?? 0;

    // Count active users (learners) in the tenant
    const [result] = await this.app.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          eq(users.tenantId, contract.tenantId),
          eq(users.role, "learner"),
          eq(users.status, "active"),
        ),
      );

    const usedSeats = Number(result?.count ?? 0);

    return {
      contractId,
      tenantId: contract.tenantId,
      totalSeats,
      usedSeats,
      availableSeats: Math.max(0, totalSeats - usedSeats),
    };
  }

  /**
   * Generate and send a Stripe invoice for an existing B2B contract.
   */
  async generateInvoice(
    contractId: string,
    customerId: string,
  ): Promise<Stripe.Invoice> {
    // Get the contract and its items
    const [contract] = await this.app.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, contractId));

    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    const items = await this.app.db
      .select()
      .from(subscriptionItems)
      .where(
        and(
          eq(subscriptionItems.subscriptionId, contractId),
          eq(subscriptionItems.status, "ACTIVE"),
        ),
      );

    if (items.length === 0) {
      throw new Error(`No active items found for contract ${contractId}`);
    }

    // Build invoice line items from subscription items
    // For B2B, the SKU maps to a price; we use the stripeSubscriptionItemId
    // or derive a price ID from the plan
    const [tenant] = await this.app.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, contract.tenantId));

    const invoiceItems = items.map((item) => ({
      priceId: item.stripeSubscriptionItemId || `price_${item.sku.toLowerCase()}`,
      quantity: item.quantity,
    }));

    const invoice = await this.stripeService.createInvoice(customerId, invoiceItems);

    this.app.log.info(
      `Generated invoice ${invoice.id} for contract=${contractId} tenant=${contract.tenantId}`,
    );

    return invoice;
  }
}
