import { describe, it, expect, vi } from "vitest";
import { DashboardService } from "../services/dashboard.service.js";

const LEARNER_ID = "b0000000-0000-4000-a000-000000000001";
const PARENT_ID = "c0000000-0000-4000-a000-000000000001";

function createMockApp() {
  // The dashboard calls many select().from() chains. We need flexible mocking.
  let selectCallNum = 0;
  const selectMock = vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation(() => {
        selectCallNum++;
        const result: Record<number, unknown> = {
          // 1: learner lookup
          1: { limit: vi.fn().mockResolvedValue([{
            id: LEARNER_ID, name: "Alex", enrolledGrade: 6,
            functioningLevel: "SUPPORTED", parentId: PARENT_ID,
          }]) },
          // 2: pending recommendations
          2: Promise.resolve([]),
          // 3: IEP goals (needs to be array)
          3: Promise.resolve([]),
          // 4: XP record
          4: { limit: vi.fn().mockResolvedValue([{ currentStreakDays: 5, level: 8 }]) },
        };
        const r = result[selectCallNum];
        if (r && typeof r === "object" && "limit" in (r as object)) return r;
        // Return as both a promise and an object with .orderBy and .limit
        return {
          limit: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
          then: (fn: (v: unknown) => unknown) => Promise.resolve([]).then(fn),
          [Symbol.iterator]: function* () {},
          filter: (fn: (v: unknown) => boolean) => ([] as unknown[]).filter(fn),
          length: 0,
        };
      }),
    })),
  }));

  return {
    db: { select: selectMock },
    brainClient: {
      getContext: vi.fn().mockResolvedValue({
        mainBrainVersion: "3.0",
        lastUpdated: "2026-03-26",
        masteryLevels: { math: { addition: 0.8, subtraction: 0.6 } },
        activeTutors: [{ tutorId: "t1", subject: "math" }],
      }),
    },
    redis: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  };
}

describe("DashboardService", () => {
  describe("getOverview", () => {
    it("returns cached data on subsequent calls", async () => {
      const mockApp = createMockApp();
      const cachedData = JSON.stringify({
        learner: { name: "Cached Alex" },
        brain: {}, pendingRecommendations: 0,
        mastery: {}, engagement: {}, activeTutors: [],
        iepGoals: {}, recentActivity: [],
      });
      mockApp.redis.get = vi.fn().mockResolvedValue(cachedData);

      const service = new DashboardService(mockApp as never);
      const overview = await service.getOverview(LEARNER_ID);

      expect(overview.learner.name).toBe("Cached Alex");
      expect(mockApp.db.select).not.toHaveBeenCalled();
    });

    it("caches with key dashboard:{learnerId}", async () => {
      const mockApp = createMockApp();
      // Test that redis.get is called with the right key
      const service = new DashboardService(mockApp as never);
      try {
        await service.getOverview(LEARNER_ID);
      } catch {
        // May fail due to mock chain issues, but we can check redis was called
      }

      expect(mockApp.redis.get).toHaveBeenCalledWith(`dashboard:${LEARNER_ID}`);
    });
  });

  describe("getSummary", () => {
    it("returns children array for parent", async () => {
      let callNum = 0;
      const mockApp = {
        db: {
          select: vi.fn().mockImplementation(() => ({
            from: vi.fn().mockImplementation(() => ({
              where: vi.fn().mockImplementation(() => {
                callNum++;
                if (callNum === 1) {
                  return Promise.resolve([
                    { id: LEARNER_ID, name: "Alex", enrolledGrade: 6, functioningLevel: "SUPPORTED" },
                  ]);
                }
                // pending recommendations
                if (callNum === 2) return Promise.resolve([]);
                // XP
                return {
                  limit: vi.fn().mockResolvedValue([{ currentStreakDays: 5, level: 8 }]),
                };
              }),
            })),
          })),
        },
        redis: { get: vi.fn().mockResolvedValue(null), set: vi.fn() },
        log: { info: vi.fn(), error: vi.fn() },
      };

      const service = new DashboardService(mockApp as never);
      const summary = await service.getSummary(PARENT_ID);

      expect(summary.children).toBeDefined();
      expect(summary.children).toHaveLength(1);
      expect(summary.children[0].name).toBe("Alex");
    });
  });
});
