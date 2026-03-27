import { describe, it, expect, vi } from "vitest";
import { LeaderboardEngine } from "../engines/leaderboard-engine.js";

function createMockApp() {
  const sortedSets = new Map<string, Map<string, number>>();

  return {
    redis: {
      zincrby: vi.fn().mockImplementation(async (key: string, increment: number, member: string) => {
        if (!sortedSets.has(key)) sortedSets.set(key, new Map());
        const set = sortedSets.get(key)!;
        const current = set.get(member) ?? 0;
        set.set(member, current + increment);
        return (current + increment).toString();
      }),
      zrevrange: vi.fn().mockImplementation(async (key: string, start: number, end: number, _withScores?: string) => {
        const set = sortedSets.get(key);
        if (!set) return [];
        const sorted = [...set.entries()].sort((a, b) => b[1] - a[1]);
        const sliced = sorted.slice(start, end + 1);
        const result: string[] = [];
        for (const [member, score] of sliced) {
          result.push(member, score.toString());
        }
        return result;
      }),
      zrevrank: vi.fn().mockImplementation(async (key: string, member: string) => {
        const set = sortedSets.get(key);
        if (!set || !set.has(member)) return null;
        const sorted = [...set.entries()].sort((a, b) => b[1] - a[1]);
        return sorted.findIndex(([m]) => m === member);
      }),
      zscore: vi.fn().mockImplementation(async (key: string, member: string) => {
        const set = sortedSets.get(key);
        if (!set || !set.has(member)) return null;
        return set.get(member)!.toString();
      }),
      smembers: vi.fn().mockResolvedValue([]),
      scan: vi.fn().mockResolvedValue(["0", []]),
      del: vi.fn().mockResolvedValue(1),
    },
    _sortedSets: sortedSets,
  };
}

describe("LeaderboardEngine", () => {
  describe("addXpToLeaderboards", () => {
    it("adds XP to global weekly leaderboard", async () => {
      const mockApp = createMockApp();
      const engine = new LeaderboardEngine(mockApp as never);

      await engine.addXpToLeaderboards("learner-1", 100);

      expect(mockApp.redis.zincrby).toHaveBeenCalledWith(
        "leaderboard:global:weekly",
        100,
        "learner-1",
      );
    });

    it("adds XP to classroom leaderboard", async () => {
      const mockApp = createMockApp();
      const engine = new LeaderboardEngine(mockApp as never);

      await engine.addXpToLeaderboards("learner-1", 50, ["class-1"]);

      expect(mockApp.redis.zincrby).toHaveBeenCalledWith(
        "leaderboard:classroom:class-1:weekly",
        50,
        "learner-1",
      );
    });
  });

  describe("getGlobalLeaderboard", () => {
    it("returns ranked entries sorted by XP", async () => {
      const mockApp = createMockApp();
      const engine = new LeaderboardEngine(mockApp as never);

      await engine.addXpToLeaderboards("learner-1", 100);
      await engine.addXpToLeaderboards("learner-2", 200);
      await engine.addXpToLeaderboards("learner-3", 150);

      const entries = await engine.getGlobalLeaderboard();

      expect(entries).toHaveLength(3);
      expect(entries[0].learnerId).toBe("learner-2");
      expect(entries[0].rank).toBe(1);
      expect(entries[1].learnerId).toBe("learner-3");
      expect(entries[2].learnerId).toBe("learner-1");
    });
  });

  describe("getLearnerRank", () => {
    it("returns rank for existing learner", async () => {
      const mockApp = createMockApp();
      const engine = new LeaderboardEngine(mockApp as never);

      await engine.addXpToLeaderboards("learner-1", 100);
      await engine.addXpToLeaderboards("learner-2", 200);

      const rank = await engine.getLearnerRank("learner-2");
      expect(rank).toBe(1);
    });

    it("returns null for non-existent learner", async () => {
      const mockApp = createMockApp();
      const engine = new LeaderboardEngine(mockApp as never);

      const rank = await engine.getLearnerRank("nonexistent");
      expect(rank).toBeNull();
    });
  });

  describe("resetWeeklyLeaderboards", () => {
    it("deletes all weekly leaderboard keys", async () => {
      const mockApp = createMockApp();
      const engine = new LeaderboardEngine(mockApp as never);

      await engine.addXpToLeaderboards("learner-1", 100);
      await engine.resetWeeklyLeaderboards();

      expect(mockApp.redis.del).toHaveBeenCalled();
    });
  });
});
