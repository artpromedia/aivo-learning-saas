import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProvisioningService } from "../services/provisioning.service.js";

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

describe("ProvisioningService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: ProvisioningService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new ProvisioningService(app);
  });

  /* ================================================================ */
  /*  provision - individual SKU                                       */
  /* ================================================================ */
  describe("provision individual SKU", () => {
    it("creates a single subscription, calls brainClient.addTutor, and publishes event", async () => {
      const { publishEvent } = await import("@aivo/events");

      // hasActiveSubscription returns false (no existing sub)
      app.db.limit.mockReturnValue([]);
      // create returns a subscription
      app.db.returning.mockReturnValue([
        {
          id: "sub-1",
          learnerId: "learner-1",
          tenantId: "tenant-1",
          sku: "ADDON_TUTOR_MATH",
          status: "ACTIVE",
        },
      ]);

      const result = await service.provision("learner-1", "tenant-1", "ADDON_TUTOR_MATH");

      // Should create exactly 1 subscription
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe("ADDON_TUTOR_MATH");

      // Should register tutor with brain service
      expect(app.brainClient.addTutor).toHaveBeenCalledWith(
        "learner-1",
        "ADDON_TUTOR_MATH",
        "tutor",
        "math",
      );
      expect(app.brainClient.addTutor).toHaveBeenCalledTimes(1);

      // Should publish activation event
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "tutor.addon.activated",
        expect.objectContaining({
          learnerId: "learner-1",
          tenantId: "tenant-1",
          sku: "ADDON_TUTOR_MATH",
          subject: "math",
        }),
      );
      expect(publishEvent).toHaveBeenCalledTimes(1);
    });

    it("provisions each individual subject with correct subject mapping", async () => {
      const subjects = [
        { sku: "ADDON_TUTOR_MATH", subject: "math" },
        { sku: "ADDON_TUTOR_ELA", subject: "ela" },
        { sku: "ADDON_TUTOR_SCIENCE", subject: "science" },
        { sku: "ADDON_TUTOR_HISTORY", subject: "history" },
        { sku: "ADDON_TUTOR_CODING", subject: "coding" },
      ];

      for (const { sku, subject } of subjects) {
        vi.clearAllMocks();
        app = createMockApp();
        service = new ProvisioningService(app);
        app.db.limit.mockReturnValue([]);
        app.db.returning.mockReturnValue([{ id: `sub-${subject}`, sku, status: "ACTIVE" }]);

        await service.provision("learner-1", "tenant-1", sku);

        expect(app.brainClient.addTutor).toHaveBeenCalledWith(
          "learner-1",
          sku,
          "tutor",
          subject,
        );
      }
    });
  });

  /* ================================================================ */
  /*  provision - BUNDLE                                               */
  /* ================================================================ */
  describe("provision BUNDLE", () => {
    it("creates 6 subscriptions (1 bundle + 5 individual) when none exist", async () => {
      const { publishEvent } = await import("@aivo/events");

      // hasActiveSubscription always returns false
      app.db.limit.mockReturnValue([]);

      let createCount = 0;
      app.db.returning.mockImplementation(() => {
        createCount++;
        return [
          {
            id: `sub-${createCount}`,
            learnerId: "learner-1",
            tenantId: "tenant-1",
            sku: `sku-${createCount}`,
            status: "ACTIVE",
          },
        ];
      });

      const result = await service.provision("learner-1", "tenant-1", "ADDON_TUTOR_BUNDLE");

      // 1 bundle + 5 individual = 6 subscriptions created
      expect(result).toHaveLength(6);

      // addTutor called for all 5 individual subjects (not for bundle itself)
      expect(app.brainClient.addTutor).toHaveBeenCalledTimes(5);
      expect(app.brainClient.addTutor).toHaveBeenCalledWith("learner-1", "ADDON_TUTOR_MATH", "tutor", "math");
      expect(app.brainClient.addTutor).toHaveBeenCalledWith("learner-1", "ADDON_TUTOR_ELA", "tutor", "ela");
      expect(app.brainClient.addTutor).toHaveBeenCalledWith("learner-1", "ADDON_TUTOR_SCIENCE", "tutor", "science");
      expect(app.brainClient.addTutor).toHaveBeenCalledWith("learner-1", "ADDON_TUTOR_HISTORY", "tutor", "history");
      expect(app.brainClient.addTutor).toHaveBeenCalledWith("learner-1", "ADDON_TUTOR_CODING", "tutor", "coding");

      // 5 activation events published (one per subject)
      expect(publishEvent).toHaveBeenCalledTimes(5);
      const publishedSubjects = (publishEvent as any).mock.calls.map(
        (call: unknown[]) => (call[2] as { subject: string }).subject,
      );
      expect(publishedSubjects).toContain("math");
      expect(publishedSubjects).toContain("ela");
      expect(publishedSubjects).toContain("science");
      expect(publishedSubjects).toContain("history");
      expect(publishedSubjects).toContain("coding");
    });

    it("skips creating individual subs that already exist", async () => {
      let limitCallCount = 0;
      app.db.limit.mockImplementation(() => {
        limitCallCount++;
        // Call 1: check bundle -> no existing
        // Calls 2-6: check individual SKUs; math (2) and science (4) already exist
        if (limitCallCount === 2 || limitCallCount === 4) {
          return [{ id: "existing" }];
        }
        return [];
      });

      let createCount = 0;
      app.db.returning.mockImplementation(() => {
        createCount++;
        return [{ id: `sub-${createCount}`, status: "ACTIVE" }];
      });

      const result = await service.provision("learner-1", "tenant-1", "ADDON_TUTOR_BUNDLE");

      // 1 bundle + 3 individual (2 already existed) = 4
      expect(result).toHaveLength(4);
    });
  });

  /* ================================================================ */
  /*  duplicate detection                                              */
  /* ================================================================ */
  describe("duplicate detection", () => {
    it("throws 409 when an active subscription already exists for the SKU", async () => {
      app.db.limit.mockReturnValue([{ id: "existing-sub" }]);

      try {
        await service.provision("learner-1", "tenant-1", "ADDON_TUTOR_MATH");
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBe("Active subscription already exists for SKU ADDON_TUTOR_MATH");
        expect(err.statusCode).toBe(409);
      }
    });

    it("does not call brainClient.addTutor or publish events when duplicate exists", async () => {
      const { publishEvent } = await import("@aivo/events");
      app.db.limit.mockReturnValue([{ id: "existing-sub" }]);

      try {
        await service.provision("learner-1", "tenant-1", "ADDON_TUTOR_MATH");
      } catch {
        // expected
      }

      expect(app.brainClient.addTutor).not.toHaveBeenCalled();
      expect(publishEvent).not.toHaveBeenCalled();
      expect(app.db.insert).not.toHaveBeenCalled();
    });
  });
});
