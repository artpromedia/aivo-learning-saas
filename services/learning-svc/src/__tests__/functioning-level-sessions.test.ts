import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionService } from "../services/session.service.js";
import type { BrainContext } from "../plugins/brain-client.js";
import type { GeneratedContent } from "../plugins/ai-client.js";

function createMockBrainContext(
  functioningLevel: string,
  attentionSpan: number = 15,
): BrainContext {
  return {
    learnerId: "learner-1",
    enrolledGrade: 3,
    functioningLevel,
    communicationMode: functioningLevel === "NON_VERBAL" ? "NON_VERBAL_AAC" : "VERBAL",
    deliveryLevels: {},
    accommodations: [],
    masteryLevels: {
      math: { counting: 0.5, addition_basic: 0.3 },
    },
    masteryGaps: [
      { subject: "math", skill: "addition_basic", level: 0.3 },
    ],
    iepGoals: [],
    attentionSpanMinutes: attentionSpan,
    preferredModality: "visual",
    cognitiveLoad: "MEDIUM",
    activeTutors: [],
  };
}

function createMockContent(): GeneratedContent {
  return {
    title: "Counting Practice",
    sections: [
      { type: "explanation", content: "Let's count objects!" },
      { type: "visual", content: "Look at these apples." },
      { type: "practice", content: "Now you try." },
      { type: "review", content: "Great job!" },
    ],
    questions: [
      { id: "q1", prompt: "How many?", type: "mc", options: ["1", "2", "3"], correctAnswer: "3", difficulty: 1 },
      { id: "q2", prompt: "How many?", type: "mc", options: ["4", "5", "6"], correctAnswer: "5", difficulty: 1 },
      { id: "q3", prompt: "How many?", type: "mc", options: ["7", "8", "9"], correctAnswer: "8", difficulty: 2 },
      { id: "q4", prompt: "How many?", type: "mc", options: ["1", "2", "3"], correctAnswer: "2", difficulty: 2 },
      { id: "q5", prompt: "How many?", type: "mc", options: ["4", "5", "6"], correctAnswer: "4", difficulty: 3 },
      { id: "q6", prompt: "How many?", type: "mc", options: ["7", "8", "9"], correctAnswer: "9", difficulty: 3 },
      { id: "q7", prompt: "How many?", type: "mc", options: ["1", "2", "3"], correctAnswer: "1", difficulty: 4 },
      { id: "q8", prompt: "How many?", type: "mc", options: ["4", "5", "6"], correctAnswer: "6", difficulty: 4 },
      { id: "q9", prompt: "How many?", type: "mc", options: ["7", "8", "9"], correctAnswer: "7", difficulty: 5 },
      { id: "q10", prompt: "How many?", type: "mc", options: ["10", "11", "12"], correctAnswer: "10", difficulty: 5 },
    ],
    estimatedDurationMinutes: 20,
  };
}

function createMockApp(functioningLevel: string) {
  const redisStore = new Map<string, string>();

  return {
    brainClient: {
      getBrainContext: vi.fn().mockResolvedValue(createMockBrainContext(functioningLevel)),
      updateMastery: vi.fn(),
    },
    aiClient: {
      generateContent: vi.fn().mockResolvedValue(createMockContent()),
      generateQuestChapter: vi.fn(),
      generateBossAssessment: vi.fn(),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    redis: {
      get: vi.fn().mockImplementation(async (key: string) => redisStore.get(key) ?? null),
      set: vi.fn().mockImplementation(async (key: string, value: string) => {
        redisStore.set(key, value);
      }),
      del: vi.fn().mockImplementation(async (key: string) => {
        redisStore.delete(key);
      }),
      zadd: vi.fn().mockResolvedValue(1),
      zrangebyscore: vi.fn().mockResolvedValue([]),
      scan: vi.fn().mockResolvedValue(["0", []]),
    },
    db: {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: "session-fl-test",
              learnerId: "learner-1",
              sessionType: "LESSON",
              subject: "math",
              skillTargets: ["addition_basic"],
              contentGenerated: createMockContent(),
              masteryBefore: { addition_basic: 0.3 },
              masteryAfter: {},
              startedAt: new Date(),
              endedAt: null,
              createdAt: new Date(),
            },
          ]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  };
}

describe("Functioning Level Session Adaptations", () => {
  describe("STANDARD functioning level", () => {
    it("returns full content without modifications", async () => {
      const mockApp = createMockApp("STANDARD");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.sections.length).toBe(4);
      expect(session.contentGenerated.questions?.length).toBe(10);
    });
  });

  describe("SUPPORTED functioning level", () => {
    it("limits questions to 7", async () => {
      const mockApp = createMockApp("SUPPORTED");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.questions?.length).toBeLessThanOrEqual(7);
    });

    it("respects attention span for duration", async () => {
      const mockApp = createMockApp("SUPPORTED");
      mockApp.brainClient.getBrainContext.mockResolvedValue(
        createMockBrainContext("SUPPORTED", 10),
      );
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.estimatedDurationMinutes).toBeLessThanOrEqual(10);
    });
  });

  describe("LOW_VERBAL functioning level", () => {
    it("limits to 5 questions max", async () => {
      const mockApp = createMockApp("LOW_VERBAL");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.questions?.length).toBeLessThanOrEqual(5);
    });

    it("limits to 2 content sections", async () => {
      const mockApp = createMockApp("LOW_VERBAL");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.sections.length).toBeLessThanOrEqual(2);
    });

    it("limits session duration to 5 minutes", async () => {
      const mockApp = createMockApp("LOW_VERBAL");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.estimatedDurationMinutes).toBeLessThanOrEqual(5);
    });
  });

  describe("NON_VERBAL functioning level", () => {
    it("limits to 3 questions max", async () => {
      const mockApp = createMockApp("NON_VERBAL");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.questions?.length).toBeLessThanOrEqual(3);
    });

    it("limits to 2 content sections", async () => {
      const mockApp = createMockApp("NON_VERBAL");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.sections.length).toBeLessThanOrEqual(2);
    });

    it("limits session duration to 3 minutes", async () => {
      const mockApp = createMockApp("NON_VERBAL");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.estimatedDurationMinutes).toBeLessThanOrEqual(3);
    });
  });

  describe("PRE_SYMBOLIC functioning level", () => {
    it("limits to 3 questions max", async () => {
      const mockApp = createMockApp("PRE_SYMBOLIC");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.questions?.length).toBeLessThanOrEqual(3);
    });

    it("limits to 2 content sections", async () => {
      const mockApp = createMockApp("PRE_SYMBOLIC");
      const service = new SessionService(mockApp as never);
      const session = await service.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(session.contentGenerated.sections.length).toBeLessThanOrEqual(2);
    });
  });

  describe("Cross-level comparison", () => {
    it("STANDARD gets more questions than LOW_VERBAL", async () => {
      const standardApp = createMockApp("STANDARD");
      const lowVerbalApp = createMockApp("LOW_VERBAL");

      const standardService = new SessionService(standardApp as never);
      const lowVerbalService = new SessionService(lowVerbalApp as never);

      const standardSession = await standardService.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });
      const lowVerbalSession = await lowVerbalService.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(standardSession.contentGenerated.questions!.length).toBeGreaterThan(
        lowVerbalSession.contentGenerated.questions!.length,
      );
    });

    it("STANDARD gets more sections than NON_VERBAL", async () => {
      const standardApp = createMockApp("STANDARD");
      const nonVerbalApp = createMockApp("NON_VERBAL");

      const standardService = new SessionService(standardApp as never);
      const nonVerbalService = new SessionService(nonVerbalApp as never);

      const standardSession = await standardService.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });
      const nonVerbalSession = await nonVerbalService.startSession({
        learnerId: "learner-1",
        subject: "math",
        sessionType: "LESSON",
      });

      expect(standardSession.contentGenerated.sections.length).toBeGreaterThan(
        nonVerbalSession.contentGenerated.sections.length,
      );
    });
  });
});
