import { eq, and, or, lte } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { tutorSubscriptions } from "@aivo/db";

export class SubscriptionService {
  constructor(private readonly app: FastifyInstance) {}

  async getActiveSubscriptions(learnerId: string) {
    return this.app.db
      .select()
      .from(tutorSubscriptions)
      .where(
        and(
          eq(tutorSubscriptions.learnerId, learnerId),
          or(
            eq(tutorSubscriptions.status, "ACTIVE"),
            eq(tutorSubscriptions.status, "GRACE_PERIOD"),
          ),
        ),
      );
  }

  async getSubscription(subscriptionId: string) {
    const [subscription] = await this.app.db
      .select()
      .from(tutorSubscriptions)
      .where(eq(tutorSubscriptions.id, subscriptionId))
      .limit(1);

    return subscription ?? null;
  }

  async hasActiveSubscription(learnerId: string, sku: string): Promise<boolean> {
    const [result] = await this.app.db
      .select({ id: tutorSubscriptions.id })
      .from(tutorSubscriptions)
      .where(
        and(
          eq(tutorSubscriptions.learnerId, learnerId),
          or(
            eq(tutorSubscriptions.sku, sku),
            eq(tutorSubscriptions.sku, "ADDON_TUTOR_BUNDLE"),
          ),
          or(
            eq(tutorSubscriptions.status, "ACTIVE"),
            eq(tutorSubscriptions.status, "GRACE_PERIOD"),
          ),
        ),
      )
      .limit(1);

    return !!result;
  }

  async hasSubjectAccess(learnerId: string, subject: string): Promise<boolean> {
    const skuMap: Record<string, string> = {
      math: "ADDON_TUTOR_MATH",
      ela: "ADDON_TUTOR_ELA",
      science: "ADDON_TUTOR_SCIENCE",
      history: "ADDON_TUTOR_HISTORY",
      coding: "ADDON_TUTOR_CODING",
    };

    const sku = skuMap[subject];
    if (!sku) return false;

    return this.hasActiveSubscription(learnerId, sku);
  }

  async create(learnerId: string, tenantId: string, sku: string) {
    const [subscription] = await this.app.db
      .insert(tutorSubscriptions)
      .values({
        learnerId,
        tenantId,
        sku,
        status: "ACTIVE",
        activatedAt: new Date(),
      })
      .returning();

    return subscription;
  }

  async cancel(subscriptionId: string) {
    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7);

    const [subscription] = await this.app.db
      .update(tutorSubscriptions)
      .set({
        status: "GRACE_PERIOD",
        gracePeriodEndsAt,
      })
      .where(eq(tutorSubscriptions.id, subscriptionId))
      .returning();

    return subscription;
  }

  async deactivate(subscriptionId: string) {
    const [subscription] = await this.app.db
      .update(tutorSubscriptions)
      .set({
        status: "CANCELLED",
        cancelledAt: new Date(),
      })
      .where(eq(tutorSubscriptions.id, subscriptionId))
      .returning();

    return subscription;
  }

  async processExpiredGracePeriods() {
    const now = new Date();

    const expired = await this.app.db
      .select()
      .from(tutorSubscriptions)
      .where(
        and(
          eq(tutorSubscriptions.status, "GRACE_PERIOD"),
          lte(tutorSubscriptions.gracePeriodEndsAt, now),
        ),
      );

    const results = [];
    for (const sub of expired) {
      const deactivated = await this.deactivate(sub.id);
      results.push(deactivated);
    }

    return results;
  }
}
