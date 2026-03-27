import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChallengeEngine } from "../engines/challenge-engine.js";

function createMockApp() {
  const redisStore = new Map<string, string>();
  const redisSetStore = new Map<string, Set<string>>();

  return {
    redis: {
      get: vi.fn().mockImplementation(async (key: string) => redisStore.get(key) ?? null),
      set: vi.fn().mockImplementation(async (key: string, value: string) => {
        redisStore.set(key, value);
      }),
      sadd: vi.fn().mockImplementation(async (key: string, ...members: string[]) => {
        if (!redisSetStore.has(key)) redisSetStore.set(key, new Set());
        for (const m of members) redisSetStore.get(key)!.add(m);
      }),
      smembers: vi.fn().mockImplementation(async (key: string) => {
        return [...(redisSetStore.get(key) ?? [])];
      }),
      incr: vi.fn().mockResolvedValue(1),
    },
    _redisStore: redisStore,
    _redisSetStore: redisSetStore,
  };
}

const testQuestions = [
  { id: "q1", prompt: "2 + 2?", options: ["3", "4", "5"], correctAnswer: "4", timeLimitMs: 5000 },
  { id: "q2", prompt: "3 + 3?", options: ["5", "6", "7"], correctAnswer: "6", timeLimitMs: 5000 },
  { id: "q3", prompt: "5 + 5?", options: ["8", "9", "10"], correctAnswer: "10", timeLimitMs: 5000 },
];

describe("ChallengeEngine", () => {
  describe("createChallenge", () => {
    it("creates challenge with invite code", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const challenge = await engine.createChallenge("player-1", "Alice", "math", testQuestions);

      expect(challenge.id).toBeTruthy();
      expect(challenge.inviteCode).toHaveLength(6);
      expect(challenge.players).toHaveLength(1);
      expect(challenge.status).toBe("waiting");
      expect(challenge.maxPlayers).toBe(4);
    });

    it("creator is first player with score 0", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const challenge = await engine.createChallenge("player-1", "Alice", "math", testQuestions);

      expect(challenge.players[0].learnerId).toBe("player-1");
      expect(challenge.players[0].score).toBe(0);
    });
  });

  describe("joinChallenge", () => {
    it("adds player to challenge via invite code", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const created = await engine.createChallenge("player-1", "Alice", "math", testQuestions);

      const joined = await engine.joinChallenge(created.inviteCode, "player-2", "Bob");

      expect(joined.players).toHaveLength(2);
      expect(joined.players[1].learnerId).toBe("player-2");
    });

    it("rejects invalid invite code", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);

      await expect(
        engine.joinChallenge("INVALID", "player-2", "Bob"),
      ).rejects.toThrow("Invalid invite code");
    });

    it("prevents duplicate joins", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const created = await engine.createChallenge("player-1", "Alice", "math", testQuestions);

      await engine.joinChallenge(created.inviteCode, "player-2", "Bob");
      const result = await engine.joinChallenge(created.inviteCode, "player-2", "Bob");

      expect(result.players).toHaveLength(2); // Not 3
    });
  });

  describe("submitAnswers", () => {
    it("scores correct answers with speed bonus", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const created = await engine.createChallenge("player-1", "Alice", "math", testQuestions);

      const result = await engine.submitAnswers(created.id, "player-1", [
        { questionId: "q1", answer: "4", timeMs: 1000 },
        { questionId: "q2", answer: "6", timeMs: 2000 },
        { questionId: "q3", answer: "10", timeMs: 3000 },
      ]);

      expect(result.correctCount).toBe(3);
      expect(result.score).toBeGreaterThan(300); // 3 × 100 base + speed bonus
    });

    it("awards 0 for incorrect answers", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const created = await engine.createChallenge("player-1", "Alice", "math", testQuestions);

      const result = await engine.submitAnswers(created.id, "player-1", [
        { questionId: "q1", answer: "3", timeMs: 1000 },
        { questionId: "q2", answer: "5", timeMs: 2000 },
      ]);

      expect(result.correctCount).toBe(0);
      expect(result.score).toBe(0);
    });

    it("marks challenge as completed when all players submit", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const created = await engine.createChallenge("player-1", "Alice", "math", testQuestions);
      await engine.joinChallenge(created.inviteCode, "player-2", "Bob");

      await engine.submitAnswers(created.id, "player-1", [
        { questionId: "q1", answer: "4", timeMs: 1000 },
      ]);
      await engine.submitAnswers(created.id, "player-2", [
        { questionId: "q1", answer: "4", timeMs: 2000 },
      ]);

      const challenge = await engine.getChallenge(created.id);
      expect(challenge!.status).toBe("completed");
    });
  });

  describe("getChallengeResult", () => {
    it("ranks players by score", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const created = await engine.createChallenge("player-1", "Alice", "math", testQuestions);
      await engine.joinChallenge(created.inviteCode, "player-2", "Bob");

      await engine.submitAnswers(created.id, "player-1", [
        { questionId: "q1", answer: "4", timeMs: 1000 },
        { questionId: "q2", answer: "6", timeMs: 1000 },
      ]);
      await engine.submitAnswers(created.id, "player-2", [
        { questionId: "q1", answer: "4", timeMs: 3000 },
      ]);

      const result = await engine.getChallengeResult(created.id);
      expect(result).not.toBeNull();
      expect(result!.rankings[0].rank).toBe(1);
      expect(result!.rankings[0].score).toBeGreaterThan(result!.rankings[1].score);
      expect(result!.rankings[0].won).toBe(true);
    });
  });

  describe("getWinner", () => {
    it("returns winner learnerId from completed challenge", async () => {
      const mockApp = createMockApp();
      const engine = new ChallengeEngine(mockApp as never);
      const created = await engine.createChallenge("player-1", "Alice", "math", testQuestions);

      await engine.submitAnswers(created.id, "player-1", [
        { questionId: "q1", answer: "4", timeMs: 1000 },
      ]);

      const challenge = await engine.getChallenge(created.id);
      expect(engine.getWinner(challenge!)).toBe("player-1");
    });
  });
});
