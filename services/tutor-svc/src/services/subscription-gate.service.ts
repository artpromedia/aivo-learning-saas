import type { FastifyInstance } from "fastify";
import { SubscriptionService } from "./subscription.service.js";
import { getSkuForSubject } from "../data/tutor-catalog.js";

export interface GateResult {
  allowed: boolean;
  sku?: string;
  requiredSku?: string;
  message?: string;
}

export class SubscriptionGateService {
  private subscriptionService: SubscriptionService;

  constructor(private readonly app: FastifyInstance) {
    this.subscriptionService = new SubscriptionService(app);
  }

  async verifyAccess(
    learnerId: string,
    subject: string,
  ): Promise<GateResult> {
    const sku = getSkuForSubject(subject);
    if (!sku) {
      return {
        allowed: false,
        message: `Unknown subject: ${subject}`,
      };
    }

    const hasAccess =
      await this.subscriptionService.hasSubjectAccess(learnerId, subject);

    if (hasAccess) {
      return { allowed: true, sku };
    }

    return {
      allowed: false,
      requiredSku: sku,
      message: `An active subscription to ${sku} or ADDON_TUTOR_BUNDLE is required to access the ${subject} tutor`,
    };
  }

  async verifySkuAccess(
    learnerId: string,
    sku: string,
  ): Promise<GateResult> {
    const hasAccess =
      await this.subscriptionService.hasActiveSubscription(learnerId, sku);

    if (hasAccess) {
      return { allowed: true };
    }

    return {
      allowed: false,
      requiredSku: sku,
      message: `An active subscription to ${sku} is required`,
    };
  }
}
