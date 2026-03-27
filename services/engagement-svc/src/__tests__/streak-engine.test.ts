import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreakEngine } from "../engines/streak-engine.js";

function createMockApp() {
  const redisStore = new Map<string, Map<string, string>>();
  const dbRecords: Array<Record<string, unknown>> = [];

  return {
    redis: {
      hgetall: vi.fn().mockImplementation(async (key: string) => {
        const hash = redisStore.get(key);
        if (!hash || hash.size === 0) return {};
        const obj: Record<string, string> = {};
        hash.forEach((v, k) => { obj[k] = v; });
        return obj;
      }),
      hget: vi.fn().mockImplementation(async (key: string, field: string) => {
        return redisStore.get(key)?.get(field) ?? null;
      }),
      hmset: vi.fn().mockImplementation(async (key: string, data: Record<string, string>) => {
        if (!redisStore.has(key)) redisStore.set(key, new Map());
        const hash = redisStore.get(key)!;
        for (const [k, v] of Object.entries(data)) {
          hash.set(k, v);
        }
      }),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "xp-1", learnerId: "l1", virtualCurrency: 200, totalXp: 100, level: 2, currentStreakDays: 0, longestStreakDays: 0 },
            ]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    _redisStore: redisStore,
  };
}

describe("StreakEngine", () => {
  describe("getStreak", () => {
    it("returns default state for new learner", async () => {
      const mockApp = createMockApp();
      const engine = new StreakEngine(mockApp as never);
      const streak = await engine.getStreak("a0000000-0000-4000-a000-000000000001");

      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(0);
      expect(streak.lastActivityDate).toBeNull();
      expect(streak.freezeUsedThisWeek).toBe(false);
    });
  });

  describe("recordActivity", () => {
    it("starts a new streak on first activity", async () => {
      const mockApp = createMockApp();
      const engine = new StreakEngine(mockApp as never);
      const result = await engine.recordActivity("a0000000-0000-4000-a000-000000000001");

      expect(result.currentStreak).toBe(1);
      expect(result.streakExtended).toBe(true);
      expect(result.streakBroken).toBe(false);
    });

    it("does not double-count same-day activity", async () => {
      const mockApp = createMockApp();
      const engine = new StreakEngine(mockApp as never);

      await engine.recordActivity("a0000000-0000-4000-a000-000000000001");
      const result = await engine.recordActivity("a0000000-0000-4000-a000-000000000001");

      expect(result.currentStreak).toBe(1);
      expect(result.streakExtended).toBe(false);
    });

    it("extends streak on consecutive day", async () => {
      const mockApp = createMockApp();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Simulate yesterday's activity
      const key = "streak:a0000000-0000-4000-a000-000000000001";
      mockApp._redisStore.set(key, new Map([
        ["currentStreak", "5"],
        ["longestStreak", "5"],
        ["lastActivityDate", yesterday.toISOString().split("T")[0]],
        ["freezeUsedThisWeek", "false"],
        ["freezeLastUsedDate", ""],
      ]));

      const engine = new StreakEngine(mockApp as never);
      const result = await engine.recordActivity("a0000000-0000-4000-a000-000000000001");

      expect(result.currentStreak).toBe(6);
      expect(result.streakExtended).toBe(true);
    });

    it("breaks streak on missed day", async () => {
      const mockApp = createMockApp();
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const key = "streak:a0000000-0000-4000-a000-000000000001";
      mockApp._redisStore.set(key, new Map([
        ["currentStreak", "10"],
        ["longestStreak", "10"],
        ["lastActivityDate", threeDaysAgo.toISOString().split("T")[0]],
        ["freezeUsedThisWeek", "false"],
        ["freezeLastUsedDate", ""],
      ]));

      const engine = new StreakEngine(mockApp as never);
      const result = await engine.recordActivity("a0000000-0000-4000-a000-000000000001");

      expect(result.currentStreak).toBe(1);
      expect(result.streakBroken).toBe(true);
    });

    it("publishes streak.extended event", async () => {
      const mockApp = createMockApp();
      const engine = new StreakEngine(mockApp as never);
      await engine.recordActivity("a0000000-0000-4000-a000-000000000001");

      const jetstream = mockApp.nats.jetstream();
      expect(jetstream.publish).toHaveBeenCalled();
    });

    it("publishes streak.broken event when streak breaks", async () => {
      const mockApp = createMockApp();
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      mockApp._redisStore.set("streak:a0000000-0000-4000-a000-000000000001", new Map([
        ["currentStreak", "5"],
        ["longestStreak", "5"],
        ["lastActivityDate", threeDaysAgo.toISOString().split("T")[0]],
        ["freezeUsedThisWeek", "false"],
        ["freezeLastUsedDate", ""],
      ]));

      const engine = new StreakEngine(mockApp as never);
      await engine.recordActivity("a0000000-0000-4000-a000-000000000001");

      const jetstream = mockApp.nats.jetstream();
      // Should publish streak.broken
      expect(jetstream.publish).toHaveBeenCalled();
    });
  });

  describe("useStreakFreeze", () => {
    it("deducts 50 coins on freeze", async () => {
      const mockApp = createMockApp();
      const engine = new StreakEngine(mockApp as never);
      const result = await engine.useStreakFreeze("a0000000-0000-4000-a000-000000000001");

      expect(result.success).toBe(true);
      expect(result.coinsDeducted).toBe(50);
    });

    it("fails when already used this week", async () => {
      const mockApp = createMockApp();
      const today = new Date().toISOString().split("T")[0];

      mockApp._redisStore.set("streak:a0000000-0000-4000-a000-000000000001", new Map([
        ["currentStreak", "5"],
        ["longestStreak", "5"],
        ["lastActivityDate", today],
        ["freezeUsedThisWeek", "true"],
        ["freezeLastUsedDate", today],
      ]));

      const engine = new StreakEngine(mockApp as never);
      const result = await engine.useStreakFreeze("a0000000-0000-4000-a000-000000000001");

      expect(result.success).toBe(false);
      expect(result.error).toContain("already used this week");
    });

    it("fails with insufficient coins", async () => {
      const mockApp = createMockApp();
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "xp-1", learnerId: "l1", virtualCurrency: 10 },
            ]),
          }),
        }),
      });

      const engine = new StreakEngine(mockApp as never);
      const result = await engine.useStreakFreeze("a0000000-0000-4000-a000-000000000001");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Insufficient");
    });
  });
});
