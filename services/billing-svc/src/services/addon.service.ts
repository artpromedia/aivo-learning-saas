import type { FastifyInstance } from "fastify";
import { tutorSubscriptions, subscriptions } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { eq, and } from "drizzle-orm";
import { getAddonBySku, BUNDLE_SUBJECTS } from "../data/addon-skus.js";
import { StripeService } from "./stripe.service.js";

export class AddonService {
  private stripeService: StripeService;

  constructor(private app: FastifyInstance) {
    this.stripeService = new StripeService(app);
  }

  async subscribeAddon(tenantId: string, learnerId: string, sku: string): Promise<void> {
    const addon = getAddonBySku(sku);
    if (!addon) {
      throw new Error(`Unknown addon SKU: ${sku}`);
    }

    // Get the tenant's active Stripe subscription
    const [sub] = await this.app.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, "ACTIVE"),
        ),
      );

    if (!sub) {
      throw new Error(`No active subscription for tenant ${tenantId}`);
    }

    const now = new Date();

    if (sku === "ADDON_TUTOR_BUNDLE") {
      // Bundle: create a single Stripe subscription item for the bundle price
      const stripeItem = await this.stripeService.createSubscriptionItem(
        sub.stripeSubscriptionId,
        addon.stripePriceId,
      );

      // Create individual tutor_subscription records for each subject
      for (const subjectSku of BUNDLE_SUBJECTS) {
        await this.app.db.insert(tutorSubscriptions).values({
          learnerId,
          tenantId,
          sku: subjectSku,
          status: "ACTIVE",
          stripeSubscriptionItemId: stripeItem.id,
          activatedAt: now,
          createdAt: now,
        });

        await publishEvent(this.app.nats, "tutor.addon.activated", {
          tenantId,
          learnerId,
          sku: subjectSku,
          bundleSku: "ADDON_TUTOR_BUNDLE",
        });
      }

      this.app.log.info(`Bundle addon activated for learner=${learnerId} tenant=${tenantId}`);
    } else {
      // Individual addon
      const stripeItem = await this.stripeService.createSubscriptionItem(
        sub.stripeSubscriptionId,
        addon.stripePriceId,
      );

      await this.app.db.insert(tutorSubscriptions).values({
        learnerId,
        tenantId,
        sku,
        status: "ACTIVE",
        stripeSubscriptionItemId: stripeItem.id,
        activatedAt: now,
        createdAt: now,
      });

      await publishEvent(this.app.nats, "tutor.addon.activated", {
        tenantId,
        learnerId,
        sku,
      });

      this.app.log.info(`Addon ${sku} activated for learner=${learnerId} tenant=${tenantId}`);
    }
  }

  async cancelAddon(addonId: string): Promise<void> {
    const now = new Date();
    const gracePeriodEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    const [addon] = await this.app.db
      .select()
      .from(tutorSubscriptions)
      .where(eq(tutorSubscriptions.id, addonId));

    if (!addon) {
      throw new Error(`Addon ${addonId} not found`);
    }

    await this.app.db
      .update(tutorSubscriptions)
      .set({
        status: "GRACE_PERIOD",
        cancelledAt: now,
        gracePeriodEndsAt,
      })
      .where(eq(tutorSubscriptions.id, addonId));

    this.app.log.info(`Addon ${addonId} set to GRACE_PERIOD until ${gracePeriodEndsAt.toISOString()}`);
  }

  async listAddons(tenantId: string) {
    return this.app.db
      .select()
      .from(tutorSubscriptions)
      .where(
        and(
          eq(tutorSubscriptions.tenantId, tenantId),
          // Return both ACTIVE and GRACE_PERIOD addons
        ),
      );
  }

  async handleGraceExpiry(addonId: string): Promise<void> {
    const [addon] = await this.app.db
      .select()
      .from(tutorSubscriptions)
      .where(eq(tutorSubscriptions.id, addonId));

    if (!addon) {
      this.app.log.warn(`Addon ${addonId} not found for grace expiry`);
      return;
    }

    // Cancel the Stripe subscription item if present
    if (addon.stripeSubscriptionItemId) {
      await this.stripeService.cancelSubscriptionItem(addon.stripeSubscriptionItemId);
    }

    // Update status to EXPIRED
    await this.app.db
      .update(tutorSubscriptions)
      .set({ status: "EXPIRED" })
      .where(eq(tutorSubscriptions.id, addonId));

    // Publish deactivation event
    await publishEvent(this.app.nats, "tutor.addon.deactivated", {
      tenantId: addon.tenantId,
      learnerId: addon.learnerId,
      sku: addon.sku,
    });

    this.app.log.info(`Addon ${addonId} expired and deactivated for learner=${addon.learnerId}`);
  }
}
