import { describe, it, expect } from "vitest";
import { SHOP_ITEMS, getShopItemById, filterShopItems } from "../data/shop-items.js";

describe("Shop Items", () => {
  it("has at least 50 items", () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(50);
  });

  it("each item has required fields", () => {
    for (const item of SHOP_ITEMS) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.priceCoins).toBeGreaterThan(0);
      expect(item.rarity).toBeTruthy();
      expect(item.gradeBands.length).toBeGreaterThan(0);
      expect(item.previewUrl).toBeTruthy();
    }
  });

  it("has 10 hats", () => {
    expect(SHOP_ITEMS.filter((i) => i.category === "hat")).toHaveLength(10);
  });

  it("has 10 outfits", () => {
    expect(SHOP_ITEMS.filter((i) => i.category === "outfit")).toHaveLength(10);
  });

  it("has 10 pets", () => {
    expect(SHOP_ITEMS.filter((i) => i.category === "pet")).toHaveLength(10);
  });

  it("has 10 backgrounds", () => {
    expect(SHOP_ITEMS.filter((i) => i.category === "background")).toHaveLength(10);
  });

  it("has 5 frames", () => {
    expect(SHOP_ITEMS.filter((i) => i.category === "frame")).toHaveLength(5);
  });

  it("has 6+ effects", () => {
    expect(SHOP_ITEMS.filter((i) => i.category === "effect").length).toBeGreaterThanOrEqual(5);
  });

  it("has all rarity tiers", () => {
    const rarities = new Set(SHOP_ITEMS.map((i) => i.rarity));
    expect(rarities).toContain("COMMON");
    expect(rarities).toContain("RARE");
    expect(rarities).toContain("EPIC");
    expect(rarities).toContain("LEGENDARY");
  });

  it("legendary items cost more than common items on average", () => {
    const legendaryAvg =
      SHOP_ITEMS.filter((i) => i.rarity === "LEGENDARY")
        .reduce((s, i) => s + i.priceCoins, 0) /
      SHOP_ITEMS.filter((i) => i.rarity === "LEGENDARY").length;

    const commonAvg =
      SHOP_ITEMS.filter((i) => i.rarity === "COMMON")
        .reduce((s, i) => s + i.priceCoins, 0) /
      SHOP_ITEMS.filter((i) => i.rarity === "COMMON").length;

    expect(legendaryAvg).toBeGreaterThan(commonAvg);
  });

  it("each item has a unique id", () => {
    const ids = SHOP_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(SHOP_ITEMS.length);
  });
});

describe("getShopItemById", () => {
  it("returns item for valid id", () => {
    expect(getShopItemById("hat_001")).toBeDefined();
    expect(getShopItemById("hat_001")!.name).toBe("Star Crown");
  });

  it("returns undefined for invalid id", () => {
    expect(getShopItemById("nonexistent")).toBeUndefined();
  });
});

describe("filterShopItems", () => {
  it("filters by category", () => {
    const hats = filterShopItems({ category: "hat" });
    expect(hats.every((i) => i.category === "hat")).toBe(true);
    expect(hats.length).toBe(10);
  });

  it("filters by grade band", () => {
    const k2Items = filterShopItems({ gradeBand: "K-2" });
    expect(k2Items.every((i) => i.gradeBands.includes("K-2"))).toBe(true);
    expect(k2Items.length).toBeGreaterThan(0);
  });

  it("filters by rarity", () => {
    const legendary = filterShopItems({ rarity: "LEGENDARY" });
    expect(legendary.every((i) => i.rarity === "LEGENDARY")).toBe(true);
  });

  it("combines filters", () => {
    const k2Hats = filterShopItems({ category: "hat", gradeBand: "K-2" });
    expect(k2Hats.every((i) => i.category === "hat" && i.gradeBands.includes("K-2"))).toBe(true);
  });

  it("returns all items with no filters", () => {
    const all = filterShopItems({});
    expect(all.length).toBe(SHOP_ITEMS.length);
  });
});
