import { describe, it, expect } from "vitest";
import { PLANS, getPlanById } from "../data/plans.js";
import { ADDON_SKUS, BUNDLE_SUBJECTS, getAddonBySku } from "../data/addon-skus.js";

describe("B2B Contract Data", () => {
  it("should have all 4 plans available for B2B", () => {
    expect(PLANS).toHaveLength(4);
  });

  it("should allow retrieving plans by ID", () => {
    const premium = getPlanById("PREMIUM");
    expect(premium).toBeDefined();
    expect(premium!.maxLearners).toBe(4);
  });

  it("should have tutor bundle at discounted price", () => {
    const bundle = getAddonBySku("ADDON_TUTOR_BUNDLE");
    expect(bundle).toBeDefined();
    expect(bundle!.price).toBe(4999);
    // Bundle is cheaper than 7 individual tutors (7 * 999 = 6993)
    expect(bundle!.price).toBeLessThan(7 * 999);
  });

  it("should have 7 subjects in bundle", () => {
    expect(BUNDLE_SUBJECTS).toHaveLength(7);
  });
});
