import { describe, it, expect } from "vitest";
import { PLANS, getPlanById } from "../data/plans.js";
import { ADDON_SKUS, BUNDLE_SUBJECTS, getAddonBySku } from "../data/addon-skus.js";

describe("B2B Contract Data", () => {
  it("should have all 3 plans available for B2B", () => {
    expect(PLANS).toHaveLength(3);
  });

  it("should allow retrieving plans by ID", () => {
    const premium = getPlanById("PREMIUM");
    expect(premium).toBeDefined();
    expect(premium!.maxLearners).toBe(5);
  });

  it("should have tutor bundle at discounted price", () => {
    const bundle = getAddonBySku("ADDON_TUTOR_BUNDLE");
    expect(bundle).toBeDefined();
    expect(bundle!.price).toBe(1499);
    // Bundle is cheaper than 5 individual tutors (5 * 499 = 2495)
    expect(bundle!.price).toBeLessThan(5 * 499);
  });

  it("should have 5 subjects in bundle", () => {
    expect(BUNDLE_SUBJECTS).toHaveLength(5);
  });
});
