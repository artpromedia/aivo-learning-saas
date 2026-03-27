import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";
import { SubscriptionService } from "./subscription.service.js";
import {
  BUNDLE_SKU,
  INDIVIDUAL_SKUS,
  getSubjectForSku,
} from "../data/tutor-catalog.js";

export class ProvisioningService {
  private subscriptionService: SubscriptionService;

  constructor(private readonly app: FastifyInstance) {
    this.subscriptionService = new SubscriptionService(app);
  }

  async provision(learnerId: string, tenantId: string, sku: string) {
    // Check no duplicate active subscription
    const alreadyActive = await this.subscriptionService.hasActiveSubscription(
      learnerId,
      sku,
    );
    if (alreadyActive) {
      throw Object.assign(
        new Error(`Active subscription already exists for SKU ${sku}`),
        { statusCode: 409 },
      );
    }

    const createdSubscriptions = [];

    // Create the primary subscription record
    const primary = await this.subscriptionService.create(
      learnerId,
      tenantId,
      sku,
    );
    createdSubscriptions.push(primary);

    if (sku === BUNDLE_SKU) {
      // Create individual subscriptions for all 5 subjects
      for (const individualSku of INDIVIDUAL_SKUS) {
        const existing =
          await this.subscriptionService.hasActiveSubscription(
            learnerId,
            individualSku,
          );
        if (!existing) {
          const sub = await this.subscriptionService.create(
            learnerId,
            tenantId,
            individualSku,
          );
          createdSubscriptions.push(sub);
        }
      }
    }

    // Determine which subjects to activate
    const skusToActivate =
      sku === BUNDLE_SKU ? INDIVIDUAL_SKUS : [sku];

    for (const activateSku of skusToActivate) {
      const subject = getSubjectForSku(activateSku);
      if (!subject) continue;

      // Register tutor with brain service
      await this.app.brainClient.addTutor(learnerId, activateSku, "tutor", subject);

      // Publish activation event
      await publishEvent(this.app.nats, "tutor.addon.activated", {
        learnerId,
        tenantId,
        sku: activateSku,
        subject,
      });
    }

    return createdSubscriptions;
  }
}
