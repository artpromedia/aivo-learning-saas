import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_UUID = "00000000-0000-4000-a000-000000000001";
const MOCK_UUID_2 = "00000000-0000-4000-a000-000000000002";
const MOCK_UUID_3 = "00000000-0000-4000-a000-000000000003";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
            limit: vi.fn().mockResolvedValue([]),
          }),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    redis: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
    },
    sql: vi.fn().mockResolvedValue([{ total: 0 }]),
    log: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  } as any;
}

function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      sub: MOCK_UUID,
      tenantId: MOCK_UUID_2,
      role: "PLATFORM_ADMIN",
      email: "admin@example.com",
    },
    ip: "127.0.0.1",
    cookies: {},
    headers: {},
    ...overrides,
  } as any;
}

function createMockReply() {
  const reply: Record<string, any> = {};
  reply.status = vi.fn().mockReturnValue(reply);
  reply.send = vi.fn().mockReturnValue(reply);
  return reply as any;
}

describe("Research Routes", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    app = createMockApp();
    vi.clearAllMocks();
  });

  describe("Cohort Routes", () => {
    it("should create a cohort with valid data", async () => {
      const cohort = {
        id: MOCK_UUID_3,
        name: "Test Cohort",
        description: "Test description",
        filters: {},
        learnerCount: 50,
        createdBy: MOCK_UUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([cohort]),
        }),
      });

      const request = createMockRequest({
        body: {
          name: "Test Cohort",
          description: "Test description",
          learnerCount: 50,
        },
      });
      const reply = createMockReply();

      const { createCohortRoute } = await import("../routes/cohorts/create.js");

      const routeHandler = vi.fn();
      const mockApp = {
        post: vi.fn((path, opts, handler) => {
          routeHandler.mockImplementation(handler);
        }),
        db: app.db,
        log: app.log,
      } as any;

      await createCohortRoute(mockApp);
      expect(mockApp.post).toHaveBeenCalledWith(
        "/research/cohorts",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should reject cohort with less than 30 learners", async () => {
      const request = createMockRequest({
        body: {
          name: "Small Cohort",
          learnerCount: 10,
        },
      });
      const reply = createMockReply();

      const { createCohortRoute } = await import("../routes/cohorts/create.js");

      let handler: Function;
      const mockApp = {
        post: vi.fn((_path: string, _opts: unknown, h: Function) => {
          handler = h;
        }),
        db: app.db,
        log: app.log,
      } as any;

      await createCohortRoute(mockApp);
      await handler!(request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("30") }),
      );
    });

    it("should require name for cohort creation", async () => {
      const request = createMockRequest({
        body: { description: "No name" },
      });
      const reply = createMockReply();

      const { createCohortRoute } = await import("../routes/cohorts/create.js");

      let handler: Function;
      const mockApp = {
        post: vi.fn((_path: string, _opts: unknown, h: Function) => {
          handler = h;
        }),
        db: app.db,
        log: app.log,
      } as any;

      await createCohortRoute(mockApp);
      await handler!(request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "name is required" }),
      );
    });

    it("should register list cohorts route", async () => {
      const { listCohortsRoute } = await import("../routes/cohorts/list.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
      } as any;

      await listCohortsRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/cohorts",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register get cohort route", async () => {
      const { getCohortRoute } = await import("../routes/cohorts/get.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
      } as any;

      await getCohortRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/cohorts/:id",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register delete cohort route", async () => {
      const { deleteCohortRoute } = await import("../routes/cohorts/delete.js");

      const mockApp = {
        delete: vi.fn(),
        db: app.db,
      } as any;

      await deleteCohortRoute(mockApp);
      expect(mockApp.delete).toHaveBeenCalledWith(
        "/research/cohorts/:id",
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("Analytics Routes", () => {
    it("should register mastery distribution route", async () => {
      const { masteryDistributionRoute } = await import("../routes/analytics/mastery-distribution.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
        sql: app.sql,
      } as any;

      await masteryDistributionRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/analytics/mastery-distribution",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register functioning level outcomes route", async () => {
      const { functioningLevelOutcomesRoute } = await import("../routes/analytics/functioning-level-outcomes.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
        sql: app.sql,
      } as any;

      await functioningLevelOutcomesRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/analytics/functioning-level-outcomes",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register intervention effectiveness route", async () => {
      const { interventionEffectivenessRoute } = await import("../routes/analytics/intervention-effectiveness.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
        sql: app.sql,
      } as any;

      await interventionEffectivenessRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/analytics/intervention-effectiveness",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register accommodation impact route", async () => {
      const { accommodationImpactRoute } = await import("../routes/analytics/accommodation-impact.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
        sql: app.sql,
      } as any;

      await accommodationImpactRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/analytics/accommodation-impact",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register tutor effectiveness route", async () => {
      const { tutorEffectivenessRoute } = await import("../routes/analytics/tutor-effectiveness.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
        sql: app.sql,
      } as any;

      await tutorEffectivenessRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/analytics/tutor-effectiveness",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register population trends route", async () => {
      const { populationTrendsRoute } = await import("../routes/analytics/population-trends.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
        sql: app.sql,
      } as any;

      await populationTrendsRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/analytics/population-trends",
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("Export Routes", () => {
    it("should register create export route", async () => {
      const { createExportRoute } = await import("../routes/exports/create.js");

      const mockApp = {
        post: vi.fn(),
        db: app.db,
        nats: app.nats,
        redis: app.redis,
      } as any;

      await createExportRoute(mockApp);
      expect(mockApp.post).toHaveBeenCalledWith(
        "/research/exports",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should reject export with missing cohortId", async () => {
      const { createExportRoute } = await import("../routes/exports/create.js");

      let handler: Function;
      const mockApp = {
        post: vi.fn((_path: string, _opts: unknown, h: Function) => {
          handler = h;
        }),
        db: app.db,
        nats: app.nats,
        redis: app.redis,
      } as any;

      await createExportRoute(mockApp);

      const request = createMockRequest({
        body: { format: "CSV" },
      });
      const reply = createMockReply();

      await handler!(request, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
    });

    it("should reject export with invalid format", async () => {
      const { createExportRoute } = await import("../routes/exports/create.js");

      let handler: Function;
      const mockApp = {
        post: vi.fn((_path: string, _opts: unknown, h: Function) => {
          handler = h;
        }),
        db: app.db,
        nats: app.nats,
        redis: app.redis,
      } as any;

      await createExportRoute(mockApp);

      const request = createMockRequest({
        body: { cohortId: MOCK_UUID, format: "EXCEL" },
      });
      const reply = createMockReply();

      await handler!(request, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
    });

    it("should register list exports route", async () => {
      const { listExportsRoute } = await import("../routes/exports/list.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
      } as any;

      await listExportsRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/exports",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register get export route", async () => {
      const { getExportRoute } = await import("../routes/exports/get.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
      } as any;

      await getExportRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/exports/:id",
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("Study Routes", () => {
    it("should register create study route", async () => {
      const { createStudyRoute } = await import("../routes/studies/create.js");

      const mockApp = {
        post: vi.fn(),
        db: app.db,
        nats: app.nats,
      } as any;

      await createStudyRoute(mockApp);
      expect(mockApp.post).toHaveBeenCalledWith(
        "/research/studies",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should reject study with same control and treatment cohort", async () => {
      const { createStudyRoute } = await import("../routes/studies/create.js");

      let handler: Function;
      const mockApp = {
        post: vi.fn((_path: string, _opts: unknown, h: Function) => {
          handler = h;
        }),
        db: app.db,
        nats: app.nats,
      } as any;

      await createStudyRoute(mockApp);

      const request = createMockRequest({
        body: {
          name: "Test Study",
          controlCohortId: MOCK_UUID,
          treatmentCohortId: MOCK_UUID,
          metric: "score",
          startDate: "2026-01-01",
        },
      });
      const reply = createMockReply();

      await handler!(request, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Control and treatment cohorts must be different" }),
      );
    });

    it("should reject study with missing required fields", async () => {
      const { createStudyRoute } = await import("../routes/studies/create.js");

      let handler: Function;
      const mockApp = {
        post: vi.fn((_path: string, _opts: unknown, h: Function) => {
          handler = h;
        }),
        db: app.db,
        nats: app.nats,
      } as any;

      await createStudyRoute(mockApp);

      const request = createMockRequest({
        body: { name: "Test Study" },
      });
      const reply = createMockReply();

      await handler!(request, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
    });

    it("should register list studies route", async () => {
      const { listStudiesRoute } = await import("../routes/studies/list.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
      } as any;

      await listStudiesRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/studies",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register get study route", async () => {
      const { getStudyRoute } = await import("../routes/studies/get.js");

      const mockApp = {
        get: vi.fn(),
        db: app.db,
      } as any;

      await getStudyRoute(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/studies/:id",
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should register update study route", async () => {
      const { updateStudyRoute } = await import("../routes/studies/update.js");

      const mockApp = {
        patch: vi.fn(),
        db: app.db,
      } as any;

      await updateStudyRoute(mockApp);
      expect(mockApp.patch).toHaveBeenCalledWith(
        "/research/studies/:id",
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("Health Route", () => {
    it("should register health route and return healthy status", async () => {
      const { healthRoutes } = await import("../routes/health.js");

      let handler: Function;
      const mockApp = {
        get: vi.fn((_path: string, h: Function) => {
          handler = h;
        }),
      } as any;

      await healthRoutes(mockApp);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/research/health",
        expect.any(Function),
      );

      const reply = createMockReply();
      await handler!({}, reply);

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "healthy",
          service: "research-svc",
        }),
      );
    });
  });
});
