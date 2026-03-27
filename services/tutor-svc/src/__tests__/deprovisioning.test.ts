import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeprovisioningService } from "../services/deprovisioning.service.js";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */
vi.mock("@aivo/events", () => ({ publishEvent: vi.fn().mockResolvedValue(undefined) }));

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
  eq: vi.fn((_col: unknown, val: unknown) => ({ _op: "eq", val })),
  and: vi.fn((...conds: unknown[]) => ({ _op: "and", conds })),
  or: vi.fn((...conds: unknown[]) => ({ _op: "or", conds })),
  lte: vi.fn((_col: unknown, val: unknown) => ({ _op: "lte", val })),
}));

/* ------------------------------------------------------------------ */
/*  Mock factory                                                       */
/* ------------------------------------------------------------------ */
function createMockApp() {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
  };
  return {
    db: mockDb,
    nats: {},
    brainClient: {
      getBrainContext: vi.fn().mockResolvedValue({ enrolled_grade: 3, functioning_level: "STANDARD" }),
      addTutor: vi.fn().mockResolvedValue({}),
      removeTutor: vi.fn().mockResolvedValue({}),
    },
    aiClient: {
      tutorRespond: vi.fn().mockResolvedValue({ content: "AI response", masterySignals: {} }),
      homeworkOCR: vi.fn().mockResolvedValue({ text: "3+4=?", problems: [{ text: "3+4=?" }], detectedSubject: "math" }),
      homeworkAdapt: vi.fn().mockResolvedValue({ problems: [{ text: "What is 3+4?" }] }),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  } as any;
}

describe("DeprovisioningService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: DeprovisioningService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new DeprovisioningService(app);
  });

  /* ================================================================ */
  /*  startGracePeriod                                                 */
  /* ================================================================ */
  describe("startGracePeriod", () => {
    it("calls cancel on the subscription and returns the result", async () => {
      const mockSub = {
        id: "sub-1",
        status: "GRACE_PERIOD",
        gracePeriodEndsAt: new Date(),
      };
      app.db.returning.mockReturnValue([mockSub]);

      const result = await service.startGracePeriod("sub-1");

      expect(result).toEqual(mockSub);
      expect(app.db.update).toHaveBeenCalled();
      expect(app.db.set).toHaveBeenCalledWith(
        expect.objectContaining({ status: "GRACE_PERIOD" }),
      );
    });

    it("throws 404 when subscription is not found (cancel returns undefined)", async () => {
      app.db.returning.mockReturnValue([]);

      try {
        await service.startGracePeriod("sub-nonexistent");
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBe("Subscription not found");
        expect(err.statusCode).toBe(404);
      }
    });

    it("sets grace period to approximately 7 days from now", async () => {
      app.db.returning.mockReturnValue([{ id: "sub-1", status: "GRACE_PERIOD" }]);

      const before = new Date();
      await service.startGracePeriod("sub-1");
      const after = new Date();

      const setCall = app.db.set.mock.calls[0][0];
      const graceEnd: Date = setCall.gracePeriodEndsAt;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(graceEnd.getTime()).toBeGreaterThanOrEqual(before.getTime() + sevenDaysMs - 1000);
      expect(graceEnd.getTime()).toBeLessThanOrEqual(after.getTime() + sevenDaysMs + 1000);
    });
  });

  /* ================================================================ */
  /*  finalizeDeprovisioning                                           */
  /* ================================================================ */
  describe("finalizeDeprovisioning", () => {
    it("checks GRACE_PERIOD status, deactivates, removes from brain, and publishes event", async () => {
      const { publishEvent } = await import("@aivo/events");

      const mockSub = {
        id: "sub-1",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        sku: "ADDON_TUTOR_MATH",
        status: "GRACE_PERIOD",
      };
      // getSubscription call
      app.db.limit.mockReturnValue([mockSub]);
      // deactivate call
      app.db.returning.mockReturnValue([
        { ...mockSub, status: "CANCELLED", cancelledAt: new Date() },
      ]);

      const result = await service.finalizeDeprovisioning("sub-1");

      expect(result.status).toBe("CANCELLED");

      // Should call removeTutor with correct learnerId and subject
      expect(app.brainClient.removeTutor).toHaveBeenCalledWith("learner-1", "math");

      // Should publish deactivation event
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "tutor.addon.deactivated",
        expect.objectContaining({
          learnerId: "learner-1",
          tenantId: "tenant-1",
          sku: "ADDON_TUTOR_MATH",
        }),
      );
    });

    it("does not call removeTutor for BUNDLE SKU (subject is 'all')", async () => {
      const { publishEvent } = await import("@aivo/events");

      const mockSub = {
        id: "sub-bundle",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        sku: "ADDON_TUTOR_BUNDLE",
        status: "GRACE_PERIOD",
      };
      app.db.limit.mockReturnValue([mockSub]);
      app.db.returning.mockReturnValue([{ ...mockSub, status: "CANCELLED" }]);

      await service.finalizeDeprovisioning("sub-bundle");

      expect(app.brainClient.removeTutor).not.toHaveBeenCalled();
      // Still publishes the event
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "tutor.addon.deactivated",
        expect.objectContaining({
          learnerId: "learner-1",
          sku: "ADDON_TUTOR_BUNDLE",
        }),
      );
    });

    it("throws 404 when subscription is not found", async () => {
      app.db.limit.mockReturnValue([]);

      try {
        await service.finalizeDeprovisioning("sub-nonexistent");
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBe("Subscription not found");
        expect(err.statusCode).toBe(404);
      }

      expect(app.brainClient.removeTutor).not.toHaveBeenCalled();
    });

    it("throws 400 when subscription is not in GRACE_PERIOD", async () => {
      const mockSub = {
        id: "sub-1",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        sku: "ADDON_TUTOR_MATH",
        status: "ACTIVE",
      };
      app.db.limit.mockReturnValue([mockSub]);

      try {
        await service.finalizeDeprovisioning("sub-1");
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBe("Subscription is not in grace period");
        expect(err.statusCode).toBe(400);
      }

      expect(app.brainClient.removeTutor).not.toHaveBeenCalled();
    });

    it("does not call removeTutor or publish events when subscription not found", async () => {
      const { publishEvent } = await import("@aivo/events");
      app.db.limit.mockReturnValue([]);

      try {
        await service.finalizeDeprovisioning("sub-x");
      } catch {
        // expected
      }

      expect(app.brainClient.removeTutor).not.toHaveBeenCalled();
      expect(publishEvent).not.toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  processExpiredGracePeriods                                       */
  /* ================================================================ */
  describe("processExpiredGracePeriods", () => {
    it("processes multiple expired subs: deactivates, removes tutors, publishes events", async () => {
      const { publishEvent } = await import("@aivo/events");

      const expiredSubs = [
        {
          id: "sub-1",
          learnerId: "learner-1",
          tenantId: "tenant-1",
          sku: "ADDON_TUTOR_MATH",
          status: "GRACE_PERIOD",
        },
        {
          id: "sub-2",
          learnerId: "learner-2",
          tenantId: "tenant-2",
          sku: "ADDON_TUTOR_ELA",
          status: "GRACE_PERIOD",
        },
      ];

      // First where call: get expired subs (inside SubscriptionService.processExpiredGracePeriods)
      app.db.where.mockReturnValueOnce(expiredSubs);

      // deactivate calls for each expired sub
      app.db.returning
        .mockReturnValueOnce([{ ...expiredSubs[0], status: "CANCELLED" }])
        .mockReturnValueOnce([{ ...expiredSubs[1], status: "CANCELLED" }]);

      const results = await service.processExpiredGracePeriods();

      expect(results).toHaveLength(2);
      expect(app.brainClient.removeTutor).toHaveBeenCalledTimes(2);
      expect(app.brainClient.removeTutor).toHaveBeenCalledWith("learner-1", "math");
      expect(app.brainClient.removeTutor).toHaveBeenCalledWith("learner-2", "ela");

      expect(publishEvent).toHaveBeenCalledTimes(2);
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "tutor.addon.deactivated",
        expect.objectContaining({ learnerId: "learner-1", sku: "ADDON_TUTOR_MATH" }),
      );
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "tutor.addon.deactivated",
        expect.objectContaining({ learnerId: "learner-2", sku: "ADDON_TUTOR_ELA" }),
      );
    });

    it("returns empty array and does nothing when no expired subs exist", async () => {
      const { publishEvent } = await import("@aivo/events");
      app.db.where.mockReturnValue([]);

      const results = await service.processExpiredGracePeriods();

      expect(results).toEqual([]);
      expect(app.brainClient.removeTutor).not.toHaveBeenCalled();
      expect(publishEvent).not.toHaveBeenCalled();
    });

    it("does not call removeTutor for BUNDLE expired subs (subject is 'all')", async () => {
      const { publishEvent } = await import("@aivo/events");

      const expiredSubs = [
        {
          id: "sub-bundle",
          learnerId: "learner-1",
          tenantId: "tenant-1",
          sku: "ADDON_TUTOR_BUNDLE",
          status: "GRACE_PERIOD",
        },
      ];

      app.db.where.mockReturnValueOnce(expiredSubs);
      app.db.returning.mockReturnValueOnce([{ ...expiredSubs[0], status: "CANCELLED" }]);

      const results = await service.processExpiredGracePeriods();

      expect(results).toHaveLength(1);
      expect(app.brainClient.removeTutor).not.toHaveBeenCalled();
      // Still publishes the event
      expect(publishEvent).toHaveBeenCalledTimes(1);
    });
  });
});
