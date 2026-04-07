import { describe, it, expect, vi } from "vitest";
import { PLANS, getPlanById } from "../data/plans.js";
import { ADDON_SKUS, getAddonBySku, BUNDLE_SUBJECTS } from "../data/addon-skus.js";

describe("Plan Definitions", () => {
  it("should have 4 plans", () => {
    expect(PLANS).toHaveLength(4);
  });

  it("should have STARTER, FAMILY, PREMIUM, ENTERPRISE plans", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["STARTER", "FAMILY", "PREMIUM", "ENTERPRISE"]);
  });

  it("should price STARTER at $19.99", () => {
    const starter = getPlanById("STARTER");
    expect(starter).toBeDefined();
    expect(starter!.price).toBe(1999);
    expect(starter!.trialDays).toBe(30);
  });

  it("should price FAMILY at $29.99", () => {
    const family = getPlanById("FAMILY");
    expect(family!.price).toBe(2999);
    expect(family!.maxLearners).toBe(4);
    expect(family!.trialDays).toBe(30);
  });

  it("should price PREMIUM at $39.99", () => {
    const premium = getPlanById("PREMIUM");
    expect(premium!.price).toBe(3999);
    expect(premium!.maxLearners).toBe(4);
    expect(premium!.trialDays).toBe(30);
  });

  it("should have ENTERPRISE as contact sales", () => {
    const enterprise = getPlanById("ENTERPRISE");
    expect(enterprise).toBeDefined();
    expect(enterprise!.contactSales).toBe(true);
    expect(enterprise!.price).toBe(0);
    expect(enterprise!.maxLearners).toBe(-1);
    expect(enterprise!.trialDays).toBe(0);
  });

  it("should offer 30-day trial on all paid plans", () => {
    for (const plan of PLANS) {
      if (plan.contactSales) {
        expect(plan.trialDays).toBe(0);
      } else if (plan.price > 0) {
        expect(plan.trialDays).toBe(30);
      }
    }
  });

  it("should return undefined for unknown plan", () => {
    expect(getPlanById("NONEXISTENT")).toBeUndefined();
  });
});

describe("Addon SKU Definitions", () => {
  it("should have 8 addon SKUs", () => {
    expect(ADDON_SKUS).toHaveLength(8);
  });

  it("should price individual tutors at $9.99", () => {
    const math = getAddonBySku("ADDON_TUTOR_MATH");
    expect(math).toBeDefined();
    expect(math!.price).toBe(999);
  });

  it("should price bundle at $49.99", () => {
    const bundle = getAddonBySku("ADDON_TUTOR_BUNDLE");
    expect(bundle).toBeDefined();
    expect(bundle!.price).toBe(4999);
  });

  it("should have 7 bundle subjects", () => {
    expect(BUNDLE_SUBJECTS).toHaveLength(7);
    expect(BUNDLE_SUBJECTS).toContain("ADDON_TUTOR_MATH");
    expect(BUNDLE_SUBJECTS).toContain("ADDON_TUTOR_ELA");
  });
});
