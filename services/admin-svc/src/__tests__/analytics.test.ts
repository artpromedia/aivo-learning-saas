import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalyticsService } from "../services/analytics.service.js";

function createMockApp() {
  return {
    sql: vi.fn().mockResolvedValue([]),
    redis: {
      get: vi.fn().mockResolvedValue(null),
      setex: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
    },
  } as any;
}

describe("AnalyticsService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: AnalyticsService;

  beforeEach(() => {
    app = createMockApp();
    service = new AnalyticsService(app);
    vi.clearAllMocks();
  });

  describe("getOverview", () => {
    it("should return cached data when available", async () => {
      const cached = { totalTenants: 100, b2cTenants: 80, b2bTenants: 20 };
      app.redis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.getOverview();
      expect(result).toEqual(cached);
      expect(app.sql).not.toHaveBeenCalled();
    });

    it("should compute and cache overview when not cached", async () => {
      app.redis.get.mockResolvedValue(null);
      app.sql
        // tenant stats
        .mockResolvedValueOnce([{ totalTenants: 100, b2cTenants: 80, b2bTenants: 20 }])
        // learner stats
        .mockResolvedValueOnce([{ totalLearners: 500, activeLearners30d: 300 }])
        // brain stats
        .mockResolvedValueOnce([{ totalBrains: 500 }])
        // brain version distribution
        .mockResolvedValueOnce([
          { version: "3.0", total: 400 },
          { version: "3.1", total: 100 },
        ])
        // revenue stats
        .mockResolvedValueOnce([{ mrr: 5000 }])
        // engagement stats
        .mockResolvedValueOnce([{ dau: 100, wau: 250, mau: 400 }])
        // avg sessions
        .mockResolvedValueOnce([{ avgSessionsPerLearnerPerWeek: 3.5 }])
        // functioning level distribution
        .mockResolvedValueOnce([
          { level: "STANDARD", total: 400 },
          { level: "SUPPORTED", total: 60 },
          { level: "LOW_VERBAL", total: 30 },
          { level: "NON_VERBAL", total: 10 },
        ]);

      const result = await service.getOverview();

      expect(result.totalTenants).toBe(100);
      expect(result.b2cTenants).toBe(80);
      expect(result.totalLearners).toBe(500);
      expect(result.brainVersion).toEqual({ "3.0": 400, "3.1": 100 });
      expect(result.mrr).toBe(5000);
      expect(result.arr).toBe(60000);
      expect(result.dau).toBe(100);
      expect(result.functioningLevelDistribution).toHaveProperty("STANDARD", 400);
      expect(app.redis.setex).toHaveBeenCalled();
    });
  });

  describe("getLearnerAnalytics", () => {
    it("should return learner enrollment and distribution", async () => {
      app.sql
        .mockResolvedValueOnce([{ totalEnrolled: 500, newThisMonth: 50, newThisWeek: 12 }])
        .mockResolvedValueOnce([
          { level: "STANDARD", total: 400 },
          { level: "SUPPORTED", total: 60 },
        ])
        .mockResolvedValueOnce([
          { grade: 3, total: 100 },
          { grade: 4, total: 150 },
        ]);

      const result = await service.getLearnerAnalytics();

      expect(result.enrollment.totalEnrolled).toBe(500);
      expect(result.functioningLevels).toHaveLength(2);
      expect(result.gradeDistribution).toHaveLength(2);
    });
  });

  describe("getRevenueAnalytics", () => {
    it("should compute MRR, ARR, ARPU and churn", async () => {
      app.sql
        .mockResolvedValueOnce([{
          activeSubscriptions: 100,
          cancelledSubscriptions: 10,
          pastDueSubscriptions: 5,
        }])
        .mockResolvedValueOnce([{ plan_id: "basic", total: 80 }])
        .mockResolvedValueOnce([{ mrr: 1500 }])
        .mockResolvedValueOnce([{ monthlyChurnRate: 2.5 }]);

      const result = await service.getRevenueAnalytics();

      expect(result.mrr).toBe(1500);
      expect(result.arr).toBe(18000);
      expect(result.arpu).toBe(15);
      expect(result.monthlyChurnRate).toBe(2.5);
    });
  });

  describe("getLlmUsageAnalytics", () => {
    it("should return token consumption and cost estimates", async () => {
      app.sql
        .mockResolvedValueOnce([{
          tokensToday: 50000,
          tokensThisWeek: 300000,
          tokensThisMonth: 1200000,
          requestsThisMonth: 5000,
        }])
        .mockResolvedValueOnce([
          { tenant_id: "t1", tenant_name: "District A", total_tokens: 500000 },
        ])
        .mockResolvedValueOnce([
          { date: "2026-03-26", tokens: 40000, requests: 200 },
          { date: "2026-03-27", tokens: 50000, requests: 250 },
        ]);

      const result = await service.getLlmUsageAnalytics();

      expect(result.tokensToday).toBe(50000);
      expect(result.tokensThisMonth).toBe(1200000);
      expect(result.estimatedMonthlyCost).toBeGreaterThan(0);
      expect(result.topTenants).toHaveLength(1);
      expect(result.dailyTrend).toHaveLength(2);
    });
  });

  describe("refreshAllCaches", () => {
    it("should compute all analytics and cache them", async () => {
      // Mock all SQL calls needed for all analytics
      app.sql.mockResolvedValue([{}]);

      await service.refreshAllCaches();

      // Should have called setex for each analytics type (7 total)
      expect(app.redis.setex).toHaveBeenCalledTimes(7);
    });
  });
});
