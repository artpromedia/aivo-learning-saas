import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionGateService } from "../services/subscription-gate.service.js";

vi.mock("@aivo/db", () => ({
  tutorSubscriptions: {
    id: "id",
    sku: "sku",
    learnerId: "learnerId",
    status: "status",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => ({ _op: "eq", val })),
  and: vi.fn((...conds: unknown[]) => ({ _op: "and", conds })),
  or: vi.fn((...conds: unknown[]) => ({ _op: "or", conds })),
}));

/* ------------------------------------------------------------------ */
/*  Mock factory                                                       */
/* ------------------------------------------------------------------ */
function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnValue([]),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  } as any;
}

describe("SubscriptionGateService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: SubscriptionGateService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new SubscriptionGateService(app);
  });

  /* ================================================================ */
  /*  verifyAccess                                                     */
  /* ================================================================ */
  describe("verifyAccess", () => {
    it("returns allowed=true and the sku when learner is subscribed", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-1" }]);

      const result = await service.verifyAccess("learner-1", "math");

      expect(result.allowed).toBe(true);
      expect(result.sku).toBe("ADDON_TUTOR_MATH");
    });

    it("returns allowed=false with requiredSku when learner is not subscribed", async () => {
      app.db.limit.mockReturnValue([]);

      const result = await service.verifyAccess("learner-1", "math");

      expect(result.allowed).toBe(false);
      expect(result.requiredSku).toBe("ADDON_TUTOR_MATH");
      expect(result.message).toContain("ADDON_TUTOR_MATH");
      expect(result.message).toContain("ADDON_TUTOR_BUNDLE");
    });

    it("returns allowed=false with message for unknown subject", async () => {
      const result = await service.verifyAccess("learner-1", "music");

      expect(result.allowed).toBe(false);
      expect(result.message).toContain("Unknown subject");
      expect(result.message).toContain("music");
      expect(app.db.select).not.toHaveBeenCalled();
    });

    it("gates each subject correctly", async () => {
      const subjects = [
        { subject: "math", sku: "ADDON_TUTOR_MATH" },
        { subject: "ela", sku: "ADDON_TUTOR_ELA" },
        { subject: "science", sku: "ADDON_TUTOR_SCIENCE" },
        { subject: "history", sku: "ADDON_TUTOR_HISTORY" },
        { subject: "coding", sku: "ADDON_TUTOR_CODING" },
      ];

      for (const { subject, sku } of subjects) {
        app.db.limit.mockReturnValue([{ id: "sub-x" }]);
        const result = await service.verifyAccess("learner-1", subject);
        expect(result.allowed).toBe(true);
        expect(result.sku).toBe(sku);
      }
    });

    it("returns allowed=false for 'all' subject (bundle subject has no individual SKU)", async () => {
      const result = await service.verifyAccess("learner-1", "all");

      expect(result.allowed).toBe(false);
      expect(result.message).toContain("Unknown subject");
    });

    it("does not include sku field when access is denied for known subject", async () => {
      app.db.limit.mockReturnValue([]);

      const result = await service.verifyAccess("learner-1", "coding");

      expect(result.allowed).toBe(false);
      expect(result.sku).toBeUndefined();
      expect(result.requiredSku).toBe("ADDON_TUTOR_CODING");
    });

    it("does not include requiredSku field when access is allowed", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-1" }]);

      const result = await service.verifyAccess("learner-1", "science");

      expect(result.allowed).toBe(true);
      expect(result.requiredSku).toBeUndefined();
    });

    it("message for denied access mentions both individual SKU and BUNDLE", async () => {
      app.db.limit.mockReturnValue([]);

      const result = await service.verifyAccess("learner-1", "history");

      expect(result.message).toContain("ADDON_TUTOR_HISTORY");
      expect(result.message).toContain("ADDON_TUTOR_BUNDLE");
      expect(result.message).toContain("history");
    });
  });

  /* ================================================================ */
  /*  verifySkuAccess                                                  */
  /* ================================================================ */
  describe("verifySkuAccess", () => {
    it("returns allowed=true when learner has active subscription for the SKU", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-1" }]);

      const result = await service.verifySkuAccess(
        "learner-1",
        "ADDON_TUTOR_MATH",
      );

      expect(result.allowed).toBe(true);
    });

    it("returns allowed=false with requiredSku when no subscription", async () => {
      app.db.limit.mockReturnValue([]);

      const result = await service.verifySkuAccess(
        "learner-1",
        "ADDON_TUTOR_CODING",
      );

      expect(result.allowed).toBe(false);
      expect(result.requiredSku).toBe("ADDON_TUTOR_CODING");
      expect(result.message).toContain("ADDON_TUTOR_CODING");
    });

    it("works with the BUNDLE SKU", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-bundle" }]);

      const result = await service.verifySkuAccess(
        "learner-1",
        "ADDON_TUTOR_BUNDLE",
      );

      expect(result.allowed).toBe(true);
    });

    it("message states the required SKU when denied", async () => {
      app.db.limit.mockReturnValue([]);

      const result = await service.verifySkuAccess(
        "learner-1",
        "ADDON_TUTOR_ELA",
      );

      expect(result.message).toBe(
        "An active subscription to ADDON_TUTOR_ELA is required",
      );
    });

    it("does not include requiredSku when access is allowed", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-1" }]);

      const result = await service.verifySkuAccess(
        "learner-1",
        "ADDON_TUTOR_SCIENCE",
      );

      expect(result.allowed).toBe(true);
      expect(result.requiredSku).toBeUndefined();
    });
  });
});
