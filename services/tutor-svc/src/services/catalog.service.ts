import { eq, and, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { tutorSubscriptions } from "@aivo/db";
import { TUTOR_CATALOG, type CatalogItem } from "../data/tutor-catalog.js";

export interface CatalogItemWithSubscription extends CatalogItem {
  subscribed: boolean;
}

export class CatalogService {
  constructor(private readonly app: FastifyInstance) {}

  async getCatalog(learnerId?: string): Promise<CatalogItemWithSubscription[]> {
    if (!learnerId) {
      return TUTOR_CATALOG.map((item) => ({ ...item, subscribed: false }));
    }

    const activeSubs = await this.app.db
      .select({ sku: tutorSubscriptions.sku })
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

    const subscribedSkus = new Set(activeSubs.map((s) => s.sku));

    return TUTOR_CATALOG.map((item) => ({
      ...item,
      subscribed: subscribedSkus.has(item.sku),
    }));
  }

  getCatalogItem(sku: string): CatalogItem | null {
    return TUTOR_CATALOG.find((item) => item.sku === sku) ?? null;
  }
}
