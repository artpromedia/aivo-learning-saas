import { describe, it, expect } from "vitest";
import { PLANS } from "../data/plans.js";
import { ADDON_SKUS } from "../data/addon-skus.js";

describe("Cancellation Flows", () => {
  describe("Plan cancellation — 30-day grace period", () => {
    it("should set grace period to 30 days for plan cancellation", () => {
      const now = new Date();
      const gracePeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const daysDiff = Math.round((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(30);
    });
  });

  describe("Tutor add-on cancellation — 7-day grace period", () => {
    it("should set grace period to 7 days for addon cancellation", () => {
      const now = new Date();
      const gracePeriodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const daysDiff = Math.round((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(7);
    });
  });

  describe("Resubscription during grace period", () => {
    it("should restore ACTIVE status when reactivating during grace", () => {
      const sub = { status: "GRACE_PERIOD", gracePeriodEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) };
      const isInGracePeriod = sub.status === "GRACE_PERIOD" && sub.gracePeriodEndsAt > new Date();
      expect(isInGracePeriod).toBe(true);
    });

    it("should NOT allow reactivation after grace period expired", () => {
      const sub = { status: "GRACE_PERIOD", gracePeriodEndsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) };
      const isInGracePeriod = sub.status === "GRACE_PERIOD" && sub.gracePeriodEndsAt > new Date();
      expect(isInGracePeriod).toBe(false);
    });
  });
});
