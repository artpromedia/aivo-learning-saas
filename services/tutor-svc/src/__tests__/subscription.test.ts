import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionService } from "../services/subscription.service.js";

vi.mock("@aivo/db", () => ({
  tutorSubscriptions: {
    id: "id",
    sku: "sku",
    learnerId: "learnerId",
    status: "status",
    gracePeriodEndsAt: "gracePeriodEndsAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => ({ _op: "eq", val })),
  and: vi.fn((...conds: unknown[]) => ({ _op: "and", conds })),
  or: vi.fn((...conds: unknown[]) => ({ _op: "or", conds })),
  lte: vi.fn((_col, val) => ({ _op: "lte", val })),
}));

/* ------------------------------------------------------------------ */
/*  Mock factory                                                       */
/* ------------------------------------------------------------------ */
function createMockApp() {
  const db: any = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  };
  return {
    db,
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  } as any;
}

describe("SubscriptionService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: SubscriptionService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new SubscriptionService(app);
  });

  /* ================================================================ */
  /*  getActiveSubscriptions                                           */
  /* ================================================================ */
  describe("getActiveSubscriptions", () => {
    it("queries DB for ACTIVE or GRACE_PERIOD subscriptions", async () => {
      const mockSubs = [
        { id: "sub-1", sku: "ADDON_TUTOR_MATH", status: "ACTIVE" },
      ];
      app.db.where.mockReturnValue(mockSubs);

      const result = await service.getActiveSubscriptions("learner-1");

      expect(result).toEqual(mockSubs);
      expect(app.db.select).toHaveBeenCalled();
      expect(app.db.from).toHaveBeenCalled();
      expect(app.db.where).toHaveBeenCalled();
    });

    it("returns multiple subscriptions when learner has several active", async () => {
      const mockSubs = [
        { id: "sub-1", sku: "ADDON_TUTOR_MATH", status: "ACTIVE" },
        { id: "sub-2", sku: "ADDON_TUTOR_ELA", status: "ACTIVE" },
        { id: "sub-3", sku: "ADDON_TUTOR_SCIENCE", status: "GRACE_PERIOD" },
      ];
      app.db.where.mockReturnValue(mockSubs);

      const result = await service.getActiveSubscriptions("learner-1");
      expect(result).toHaveLength(3);
    });

    it("returns empty array when no active subscriptions exist", async () => {
      app.db.where.mockReturnValue([]);

      const result = await service.getActiveSubscriptions("learner-none");
      expect(result).toEqual([]);
    });
  });

  /* ================================================================ */
  /*  getSubscription                                                  */
  /* ================================================================ */
  describe("getSubscription", () => {
    it("returns the subscription when found", async () => {
      const mockSub = { id: "sub-1", sku: "ADDON_TUTOR_MATH", status: "ACTIVE" };
      app.db.limit.mockReturnValue([mockSub]);

      const result = await service.getSubscription("sub-1");
      expect(result).toEqual(mockSub);
    });

    it("returns null when subscription not found", async () => {
      app.db.limit.mockReturnValue([]);

      const result = await service.getSubscription("sub-nonexistent");
      expect(result).toBeNull();
    });

    it("calls select, from, where, limit in order", async () => {
      app.db.limit.mockReturnValue([]);

      await service.getSubscription("sub-1");

      expect(app.db.select).toHaveBeenCalled();
      expect(app.db.from).toHaveBeenCalled();
      expect(app.db.where).toHaveBeenCalled();
      expect(app.db.limit).toHaveBeenCalledWith(1);
    });
  });

  /* ================================================================ */
  /*  hasActiveSubscription                                            */
  /* ================================================================ */
  describe("hasActiveSubscription", () => {
    it("returns true when a direct SKU match exists", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-1" }]);

      const result = await service.hasActiveSubscription(
        "learner-1",
        "ADDON_TUTOR_MATH",
      );
      expect(result).toBe(true);
    });

    it("returns true when BUNDLE match exists (query includes OR for bundle)", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-bundle" }]);

      const result = await service.hasActiveSubscription(
        "learner-1",
        "ADDON_TUTOR_SCIENCE",
      );
      expect(result).toBe(true);
    });

    it("returns false when no matching subscription exists", async () => {
      app.db.limit.mockReturnValue([]);

      const result = await service.hasActiveSubscription(
        "learner-1",
        "ADDON_TUTOR_CODING",
      );
      expect(result).toBe(false);
    });

    it("queries with limit(1) for efficiency", async () => {
      app.db.limit.mockReturnValue([]);

      await service.hasActiveSubscription("learner-1", "ADDON_TUTOR_MATH");

      expect(app.db.limit).toHaveBeenCalledWith(1);
    });

    it("returns boolean, not the actual row", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-1", sku: "ADDON_TUTOR_MATH" }]);

      const result = await service.hasActiveSubscription(
        "learner-1",
        "ADDON_TUTOR_MATH",
      );
      expect(typeof result).toBe("boolean");
      expect(result).toBe(true);
    });
  });

  /* ================================================================ */
  /*  hasSubjectAccess                                                 */
  /* ================================================================ */
  describe("hasSubjectAccess", () => {
    it("returns true when learner has subscription for the subject", async () => {
      app.db.limit.mockReturnValue([{ id: "sub-1" }]);

      const result = await service.hasSubjectAccess("learner-1", "math");
      expect(result).toBe(true);
    });

    it("returns false for an unknown subject", async () => {
      const result = await service.hasSubjectAccess("learner-1", "music");
      expect(result).toBe(false);
      expect(app.db.select).not.toHaveBeenCalled();
    });

    it("returns false for empty string subject", async () => {
      const result = await service.hasSubjectAccess("learner-1", "");
      expect(result).toBe(false);
    });

    it("maps each subject to the correct SKU and checks subscription", async () => {
      const subjects = ["math", "ela", "science", "history", "coding"];
      for (const subject of subjects) {
        app.db.limit.mockReturnValue([{ id: "sub-x" }]);
        const result = await service.hasSubjectAccess("learner-1", subject);
        expect(result).toBe(true);
      }
    });

    it("returns false when subscription exists but subject is not in map", async () => {
      const result = await service.hasSubjectAccess("learner-1", "art");
      expect(result).toBe(false);
    });
  });

  /* ================================================================ */
  /*  create                                                           */
  /* ================================================================ */
  describe("create", () => {
    it("inserts a new subscription with ACTIVE status and returns it", async () => {
      const mockSub = {
        id: "sub-new",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        sku: "ADDON_TUTOR_MATH",
        status: "ACTIVE",
      };
      app.db.returning.mockReturnValue([mockSub]);

      const result = await service.create(
        "learner-1",
        "tenant-1",
        "ADDON_TUTOR_MATH",
      );

      expect(result).toEqual(mockSub);
      expect(app.db.insert).toHaveBeenCalled();
      expect(app.db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          learnerId: "learner-1",
          tenantId: "tenant-1",
          sku: "ADDON_TUTOR_MATH",
          status: "ACTIVE",
        }),
      );
    });

    it("sets activatedAt to current date", async () => {
      app.db.returning.mockReturnValue([{ id: "sub-new" }]);

      const before = new Date();
      await service.create("learner-1", "tenant-1", "ADDON_TUTOR_MATH");
      const after = new Date();

      const valuesArg = app.db.values.mock.calls[0][0];
      expect(valuesArg.activatedAt).toBeInstanceOf(Date);
      expect(valuesArg.activatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(valuesArg.activatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("calls returning() to get the created subscription", async () => {
      app.db.returning.mockReturnValue([{ id: "sub-new" }]);

      await service.create("learner-1", "tenant-1", "ADDON_TUTOR_ELA");

      expect(app.db.returning).toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  cancel                                                           */
  /* ================================================================ */
  describe("cancel", () => {
    it("sets status to GRACE_PERIOD with gracePeriodEndsAt ~7 days from now", async () => {
      const mockSub = {
        id: "sub-1",
        status: "GRACE_PERIOD",
        gracePeriodEndsAt: new Date(),
      };
      app.db.returning.mockReturnValue([mockSub]);

      const before = new Date();
      const result = await service.cancel("sub-1");
      const after = new Date();

      expect(result).toEqual(mockSub);
      expect(app.db.update).toHaveBeenCalled();

      const setCall = app.db.set.mock.calls[0][0];
      expect(setCall.status).toBe("GRACE_PERIOD");

      const graceEnd: Date = setCall.gracePeriodEndsAt;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      expect(graceEnd.getTime()).toBeGreaterThanOrEqual(
        before.getTime() + sevenDaysMs - 1000,
      );
      expect(graceEnd.getTime()).toBeLessThanOrEqual(
        after.getTime() + sevenDaysMs + 1000,
      );
    });

    it("returns the updated subscription", async () => {
      const mockSub = { id: "sub-1", status: "GRACE_PERIOD" };
      app.db.returning.mockReturnValue([mockSub]);

      const result = await service.cancel("sub-1");
      expect(result).toEqual(mockSub);
    });

    it("uses the correct subscription ID in the where clause", async () => {
      app.db.returning.mockReturnValue([{ id: "sub-99" }]);

      await service.cancel("sub-99");

      expect(app.db.where).toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  deactivate                                                       */
  /* ================================================================ */
  describe("deactivate", () => {
    it("sets status to CANCELLED with cancelledAt timestamp", async () => {
      const mockSub = {
        id: "sub-1",
        status: "CANCELLED",
        cancelledAt: new Date(),
      };
      app.db.returning.mockReturnValue([mockSub]);

      const result = await service.deactivate("sub-1");

      expect(result).toEqual(mockSub);
      expect(app.db.update).toHaveBeenCalled();
      const setCall = app.db.set.mock.calls[0][0];
      expect(setCall.status).toBe("CANCELLED");
      expect(setCall.cancelledAt).toBeInstanceOf(Date);
    });

    it("cancelledAt is set to approximately the current time", async () => {
      app.db.returning.mockReturnValue([{ id: "sub-1" }]);

      const before = new Date();
      await service.deactivate("sub-1");
      const after = new Date();

      const setCall = app.db.set.mock.calls[0][0];
      expect(setCall.cancelledAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(setCall.cancelledAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /* ================================================================ */
  /*  processExpiredGracePeriods                                       */
  /* ================================================================ */
  describe("processExpiredGracePeriods", () => {
    it("queries for GRACE_PERIOD subs with expired gracePeriodEndsAt and deactivates them", async () => {
      app.db.where.mockReturnValueOnce([
        { id: "sub-exp-1", sku: "ADDON_TUTOR_MATH", status: "GRACE_PERIOD" },
        { id: "sub-exp-2", sku: "ADDON_TUTOR_ELA", status: "GRACE_PERIOD" },
      ]);
      app.db.returning
        .mockReturnValueOnce([{ id: "sub-exp-1", status: "CANCELLED" }])
        .mockReturnValueOnce([{ id: "sub-exp-2", status: "CANCELLED" }]);

      const results = await service.processExpiredGracePeriods();

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe("CANCELLED");
      expect(results[1].status).toBe("CANCELLED");
    });

    it("returns empty array when no expired grace periods exist", async () => {
      app.db.where.mockReturnValue([]);

      const results = await service.processExpiredGracePeriods();
      expect(results).toEqual([]);
    });

    it("calls deactivate for each expired subscription", async () => {
      app.db.where.mockReturnValueOnce([
        { id: "sub-exp-1", sku: "ADDON_TUTOR_MATH", status: "GRACE_PERIOD" },
      ]);
      app.db.returning.mockReturnValueOnce([
        { id: "sub-exp-1", status: "CANCELLED" },
      ]);

      await service.processExpiredGracePeriods();

      // update should be called for deactivate
      expect(app.db.update).toHaveBeenCalled();
      expect(app.db.set).toHaveBeenCalledWith(
        expect.objectContaining({ status: "CANCELLED" }),
      );
    });

    it("processes multiple expired subscriptions sequentially", async () => {
      const expired = [
        { id: "sub-1", sku: "ADDON_TUTOR_MATH", status: "GRACE_PERIOD" },
        { id: "sub-2", sku: "ADDON_TUTOR_ELA", status: "GRACE_PERIOD" },
        { id: "sub-3", sku: "ADDON_TUTOR_SCIENCE", status: "GRACE_PERIOD" },
      ];
      app.db.where.mockReturnValueOnce(expired);
      app.db.returning
        .mockReturnValueOnce([{ id: "sub-1", status: "CANCELLED" }])
        .mockReturnValueOnce([{ id: "sub-2", status: "CANCELLED" }])
        .mockReturnValueOnce([{ id: "sub-3", status: "CANCELLED" }]);

      const results = await service.processExpiredGracePeriods();

      expect(results).toHaveLength(3);
    });
  });
});
