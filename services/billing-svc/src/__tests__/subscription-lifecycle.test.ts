import { describe, it, expect, vi } from "vitest";
import { PLANS, getPlanById } from "../data/plans.js";
import { ADDON_SKUS, getAddonBySku, BUNDLE_SUBJECTS } from "../data/addon-skus.js";

describe("Plan Definitions", () => {
  it("should have 3 B2C plans", () => {
    expect(PLANS).toHaveLength(3);
  });

  it("should have STARTER, FAMILY, PREMIUM plans", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["STARTER", "FAMILY", "PREMIUM"]);
  });

  it("should price STARTER at $9.99", () => {
    const starter = getPlanById("STARTER");
    expect(starter).toBeDefined();
    expect(starter!.price).toBe(999);
  });

  it("should price FAMILY at $19.99", () => {
    const family = getPlanById("FAMILY");
    expect(family!.price).toBe(1999);
    expect(family!.maxLearners).toBe(3);
  });

  it("should price PREMIUM at $29.99", () => {
    const premium = getPlanById("PREMIUM");
    expect(premium!.price).toBe(2999);
    expect(premium!.maxLearners).toBe(5);
  });

  it("should return undefined for unknown plan", () => {
    expect(getPlanById("NONEXISTENT")).toBeUndefined();
  });
});

describe("Addon SKU Definitions", () => {
  it("should have 6 addon SKUs", () => {
    expect(ADDON_SKUS).toHaveLength(6);
  });

  it("should price individual tutors at $4.99", () => {
    const math = getAddonBySku("ADDON_TUTOR_MATH");
    expect(math).toBeDefined();
    expect(math!.price).toBe(499);
  });

  it("should price bundle at $14.99", () => {
    const bundle = getAddonBySku("ADDON_TUTOR_BUNDLE");
    expect(bundle).toBeDefined();
    expect(bundle!.price).toBe(1499);
  });

  it("should have 5 bundle subjects", () => {
    expect(BUNDLE_SUBJECTS).toHaveLength(5);
    expect(BUNDLE_SUBJECTS).toContain("ADDON_TUTOR_MATH");
    expect(BUNDLE_SUBJECTS).toContain("ADDON_TUTOR_ELA");
  });
});
