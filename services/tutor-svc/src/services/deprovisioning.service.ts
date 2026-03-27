import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";
import { SubscriptionService } from "./subscription.service.js";
import { getSubjectForSku } from "../data/tutor-catalog.js";

export class DeprovisioningService {
  private subscriptionService: SubscriptionService;

  constructor(private readonly app: FastifyInstance) {
    this.subscriptionService = new SubscriptionService(app);
  }

  async startGracePeriod(subscriptionId: string) {
    const subscription =
      await this.subscriptionService.cancel(subscriptionId);

    if (!subscription) {
      throw Object.assign(new Error("Subscription not found"), {
        statusCode: 404,
      });
    }

    return subscription;
  }

  async finalizeDeprovisioning(subscriptionId: string) {
    const subscription =
      await this.subscriptionService.getSubscription(subscriptionId);

    if (!subscription) {
      throw Object.assign(new Error("Subscription not found"), {
        statusCode: 404,
      });
    }

    if (subscription.status !== "GRACE_PERIOD") {
      throw Object.assign(
        new Error("Subscription is not in grace period"),
        { statusCode: 400 },
      );
    }

    // Deactivate the subscription
    const deactivated =
      await this.subscriptionService.deactivate(subscriptionId);

    const subject = getSubjectForSku(subscription.sku);

    if (subject && subject !== "all") {
      // Remove tutor from brain service
      await this.app.brainClient.removeTutor(
        subscription.learnerId,
        subject,
      );
    }

    // Publish deactivation event
    await publishEvent(this.app.nats, "tutor.addon.deactivated", {
      learnerId: subscription.learnerId,
      tenantId: subscription.tenantId,
      sku: subscription.sku,
    });

    return deactivated;
  }

  async processExpiredGracePeriods() {
    const expired =
      await this.subscriptionService.processExpiredGracePeriods();

    const results = [];
    for (const sub of expired) {
      const subject = getSubjectForSku(sub.sku);

      if (subject && subject !== "all") {
        await this.app.brainClient.removeTutor(sub.learnerId, subject);
      }

      await publishEvent(this.app.nats, "tutor.addon.deactivated", {
        learnerId: sub.learnerId,
        tenantId: sub.tenantId,
        sku: sub.sku,
      });

      results.push(sub);
    }

    return results;
  }
}
