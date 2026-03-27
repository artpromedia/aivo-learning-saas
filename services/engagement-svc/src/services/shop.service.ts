import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";
import { CurrencyEngine } from "../engines/currency-engine.js";
import { SHOP_ITEMS, getShopItemById, filterShopItems, type ItemCategory, type ItemRarity } from "../data/shop-items.js";

const INVENTORY_PREFIX = "inventory:";

export class ShopService {
  private readonly currency: CurrencyEngine;

  constructor(private readonly app: FastifyInstance) {
    this.currency = new CurrencyEngine(app);
  }

  getCatalog(filters?: { category?: ItemCategory; gradeBand?: string; rarity?: ItemRarity }) {
    if (filters && (filters.category || filters.gradeBand || filters.rarity)) {
      return filterShopItems(filters);
    }
    return SHOP_ITEMS;
  }

  async purchase(learnerId: string, itemId: string): Promise<{
    success: boolean;
    item?: typeof SHOP_ITEMS[0];
    newBalance?: number;
    error?: string;
  }> {
    const item = getShopItemById(itemId);
    if (!item) {
      return { success: false, error: "Item not found" };
    }

    // Check if already owned
    const owned = await this.getInventory(learnerId);
    if (owned.some((i) => i.id === itemId)) {
      return { success: false, error: "Item already owned" };
    }

    // Deduct coins
    const result = await this.currency.deductCoins(learnerId, item.priceCoins);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Add to inventory
    await this.app.redis.sadd(`${INVENTORY_PREFIX}${learnerId}`, itemId);

    // Publish purchase event
    await publishEvent(this.app.nats, "engagement.shop.purchased", {
      learnerId,
      itemId,
      cost: item.priceCoins,
    });

    return { success: true, item, newBalance: result.newBalance };
  }

  async getInventory(learnerId: string) {
    const itemIds = await this.app.redis.smembers(`${INVENTORY_PREFIX}${learnerId}`);
    return itemIds
      .map((id) => getShopItemById(id))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);
  }
}
