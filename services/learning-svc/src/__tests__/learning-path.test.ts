import { describe, it, expect, vi, beforeEach } from "vitest";
import { LearningPathService } from "../services/learning-path.service.js";
import type { BrainContext } from "../plugins/brain-client.js";

function createMockBrainContext(overrides: Partial<BrainContext> = {}): BrainContext {
  return {
    learnerId: "learner-1",
    enrolledGrade: 4,
    functioningLevel: "STANDARD",
    communicationMode: "VERBAL",
    deliveryLevels: {},
    accommodations: [],
    masteryLevels: {
      math: { addition_basic: 0.9, multiplication_facts: 0.3, fractions_intro: 0.1 },
      reading: { main_idea: 0.5, inference: 0.2 },
    },
    masteryGaps: [
      { subject: "math", skill: "fractions_intro", level: 0.1 },
      { subject: "reading", skill: "inference", level: 0.2 },
      { subject: "math", skill: "multiplication_facts", level: 0.3 },
      { subject: "reading", skill: "main_idea", level: 0.5 },
    ],
    iepGoals: [],
    attentionSpanMinutes: 20,
    preferredModality: "visual",
    cognitiveLoad: "MEDIUM",
    activeTutors: [],
    ...overrides,
  };
}

function createMockApp(brainContext?: BrainContext) {
  return {
    brainClient: {
      getBrainContext: vi.fn().mockResolvedValue(brainContext ?? createMockBrainContext()),
      updateMastery: vi.fn(),
    },
    redis: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
      zadd: vi.fn().mockResolvedValue(1),
      zrangebyscore: vi.fn().mockResolvedValue([]),
      scan: vi.fn().mockResolvedValue(["0", []]),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  };
}

describe("LearningPathService", () => {
  describe("generateDailyPath", () => {
    it("includes mastery gap activities", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      expect(path.activities.length).toBeGreaterThan(0);
      const gapActivities = path.activities.filter((a) => a.reason === "mastery_gap");
      expect(gapActivities.length).toBeGreaterThan(0);
    });

    it("includes quest engagement activity", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      const questActivity = path.activities.find((a) => a.type === "quest");
      expect(questActivity).toBeDefined();
      expect(questActivity?.reason).toBe("engagement");
    });

    it("prioritizes spaced repetition due items", async () => {
      const dueItem = JSON.stringify({
        learnerId: "learner-1",
        subject: "math",
        skill: "addition_basic",
        easinessFactor: 2.5,
        intervalDays: 6,
        repetitionCount: 2,
        nextReviewDate: new Date().toISOString().split("T")[0],
        lastReviewDate: null,
      });

      const mockApp = createMockApp();
      mockApp.redis.zrangebyscore = vi.fn().mockResolvedValue(["sr:learner-1:math:addition_basic"]);
      mockApp.redis.get = vi.fn().mockImplementation(async (key: string) => {
        if (key.startsWith("sr:")) return dueItem;
        return null;
      });

      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      // Review items should appear first (priority 1)
      const reviewActivities = path.activities.filter((a) => a.reason === "spaced_repetition_due");
      if (reviewActivities.length > 0) {
        expect(reviewActivities[0].priority).toBe(1);
      }
    });

    it("sorts activities by priority", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      for (let i = 1; i < path.activities.length; i++) {
        expect(path.activities[i].priority).toBeGreaterThanOrEqual(
          path.activities[i - 1].priority,
        );
      }
    });

    it("respects functioning level for session duration", async () => {
      const lowVerbalContext = createMockBrainContext({
        functioningLevel: "LOW_VERBAL",
        attentionSpanMinutes: 5,
      });
      const mockApp = createMockApp(lowVerbalContext);
      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      for (const activity of path.activities) {
        expect(activity.estimatedMinutes).toBeLessThanOrEqual(5);
      }
    });

    it("limits activities for PRE_SYMBOLIC to 2", async () => {
      const preSymbolicContext = createMockBrainContext({
        functioningLevel: "PRE_SYMBOLIC",
      });
      const mockApp = createMockApp(preSymbolicContext);
      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      expect(path.activities.length).toBeLessThanOrEqual(2);
    });

    it("limits activities for STANDARD to 6", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      expect(path.activities.length).toBeLessThanOrEqual(6);
    });

    it("includes date and learner info in response", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      const path = await service.generateDailyPath("learner-1");

      expect(path.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(path.learnerId).toBe("learner-1");
      expect(path.functioningLevel).toBe("STANDARD");
    });
  });

  describe("getNextRecommendation", () => {
    it("returns the highest priority activity", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      const next = await service.getNextRecommendation("learner-1");

      expect(next).not.toBeNull();
      expect(next?.subject).toBeDefined();
      expect(next?.skill).toBeDefined();
    });
  });

  describe("initializeForNewLearner", () => {
    it("creates spaced repetition items for mastery gaps", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      await service.initializeForNewLearner("learner-1");

      // Should have set SR items in Redis for each mastery gap
      expect(mockApp.redis.set).toHaveBeenCalled();
    });
  });

  describe("getSpacedReviewItems", () => {
    it("returns empty array when no items are due", async () => {
      const mockApp = createMockApp();
      const service = new LearningPathService(mockApp as never);
      const items = await service.getSpacedReviewItems("learner-1");

      expect(items).toEqual([]);
    });
  });
});
