import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionService } from "../services/session.service.js";
import type { BrainContext } from "../plugins/brain-client.js";
import type { GeneratedContent } from "../plugins/ai-client.js";

const LEARNER_UUID = "a0000000-0000-4000-a000-000000000001";
const SESSION_UUID = "b0000000-0000-4000-a000-000000000001";

function createMockBrainContext(overrides: Partial<BrainContext> = {}): BrainContext {
  return {
    learnerId: LEARNER_UUID,
    enrolledGrade: 3,
    functioningLevel: "STANDARD",
    communicationMode: "VERBAL",
    deliveryLevels: {},
    accommodations: [],
    masteryLevels: {
      math: { addition_basic: 0.5, multiplication_facts: 0.3 },
    },
    masteryGaps: [
      { subject: "math", skill: "multiplication_facts", level: 0.3 },
      { subject: "math", skill: "addition_basic", level: 0.5 },
    ],
    iepGoals: [],
    attentionSpanMinutes: 15,
    preferredModality: "visual",
    cognitiveLoad: "MEDIUM",
    activeTutors: [],
    ...overrides,
  };
}

function createMockContent(): GeneratedContent {
  return {
    title: "Multiplication Facts Practice",
    sections: [
      { type: "explanation", content: "Let's learn multiplication!" },
      { type: "example", content: "3 x 4 = 12" },
    ],
    questions: [
      {
        id: "q1",
        prompt: "What is 3 x 5?",
        type: "multiple_choice",
        options: ["10", "12", "15", "18"],
        correctAnswer: "15",
        difficulty: 1,
      },
      {
        id: "q2",
        prompt: "What is 4 x 6?",
        type: "multiple_choice",
        options: ["20", "24", "28", "32"],
        correctAnswer: "24",
        difficulty: 2,
      },
    ],
    estimatedDurationMinutes: 15,
  };
}

function createMockApp() {
  const publishedEvents: Array<{ event: string; data: unknown }> = [];
  const redisStore = new Map<string, string>();
  const dbSessions: Array<Record<string, unknown>> = [];

  return {
    brainClient: {
      getBrainContext: vi.fn().mockResolvedValue(createMockBrainContext()),
      updateMastery: vi.fn().mockResolvedValue(undefined),
    },
    aiClient: {
      generateContent: vi.fn().mockResolvedValue(createMockContent()),
      generateQuestChapter: vi.fn(),
      generateBossAssessment: vi.fn(),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockImplementation(async (subject: string, data: unknown) => {
          publishedEvents.push({ event: subject, data });
        }),
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
              id: SESSION_UUID,
              learnerId: LEARNER_UUID,
              sessionType: "LESSON",
              subject: "math",
              skillTargets: ["multiplication_facts"],
              contentGenerated: createMockContent(),
              masteryBefore: { multiplication_facts: 0.3 },
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
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    _publishedEvents: publishedEvents,
    _redisStore: redisStore,
  };
}

describe("SessionService — Lifecycle", () => {
  let mockApp: ReturnType<typeof createMockApp>;
  let service: SessionService;

  beforeEach(() => {
    mockApp = createMockApp();
    service = new SessionService(mockApp as never);
  });

  describe("startSession", () => {
    it("fetches Brain context for the learner", async () => {
      await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
      });

      expect(mockApp.brainClient.getBrainContext).toHaveBeenCalledWith(LEARNER_UUID);
    });

    it("generates content via ai-svc with Brain context", async () => {
      await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
      });

      expect(mockApp.aiClient.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          learnerId: LEARNER_UUID,
          subject: "math",
          sessionType: "LESSON",
        }),
      );
    });

    it("creates a session record in database", async () => {
      await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
      });

      expect(mockApp.db.insert).toHaveBeenCalled();
    });

    it("caches session in Redis for fast access", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
      });

      expect(mockApp.redis.set).toHaveBeenCalledWith(
        `session:${session.id}`,
        expect.any(String),
        "EX",
        86400,
      );
    });

    it("records mastery_before from Brain context", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
        skillTargets: ["multiplication_facts"],
      });

      expect(session.masteryBefore).toEqual({ multiplication_facts: 0.3 });
    });

    it("uses provided skillTargets when specified", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "QUIZ",
        skillTargets: ["addition_basic"],
      });

      expect(session.skillTargets).toEqual(["addition_basic"]);
    });

    it("selects skills from mastery gaps when no targets provided", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
      });

      // Should pick from mastery gaps sorted by lowest level
      expect(session.skillTargets.length).toBeGreaterThan(0);
    });
  });

  describe("addInteraction", () => {
    it("appends interaction to session", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
      });

      const updated = await service.addInteraction(session.id, {
        responseType: "progress",
        response: { sectionIndex: 0 },
        timeSpentMs: 5000,
      });

      expect(updated.interactions).toHaveLength(1);
      expect(updated.interactions[0].responseType).toBe("progress");
    });

    it("checks answer correctness for quiz responses", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "QUIZ",
      });

      const updated = await service.addInteraction(session.id, {
        responseType: "answer",
        response: { questionId: "q1", answer: "15" },
        timeSpentMs: 3000,
      });

      expect(updated.interactions[0].correct).toBe(true);
    });

    it("marks incorrect answers as false", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "QUIZ",
      });

      const updated = await service.addInteraction(session.id, {
        responseType: "answer",
        response: { questionId: "q1", answer: "10" },
        timeSpentMs: 3000,
      });

      expect(updated.interactions[0].correct).toBe(false);
    });

    it("throws 404 for non-existent session", async () => {
      await expect(
        service.addInteraction("non-existent-id", {
          responseType: "progress",
          response: {},
          timeSpentMs: 1000,
        }),
      ).rejects.toThrow("Session not found");
    });
  });

  describe("completeSession", () => {
    it("calculates mastery delta from interactions", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "QUIZ",
        skillTargets: ["multiplication_facts"],
      });

      // Add correct answers
      await service.addInteraction(session.id, {
        responseType: "answer",
        response: { questionId: "q1", answer: "15" },
        timeSpentMs: 3000,
      });
      await service.addInteraction(session.id, {
        responseType: "answer",
        response: { questionId: "q2", answer: "24" },
        timeSpentMs: 3000,
      });

      const completed = await service.completeSession(session.id);

      expect(completed.masteryAfter.multiplication_facts).toBeGreaterThan(
        completed.masteryBefore.multiplication_facts ?? 0,
      );
    });

    it("publishes lesson.completed event for lessons", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
        skillTargets: ["multiplication_facts"],
      });

      await service.addInteraction(session.id, {
        responseType: "progress",
        response: { completed: true },
        timeSpentMs: 10000,
      });

      await service.completeSession(session.id);

      const jetstream = mockApp.nats.jetstream();
      expect(jetstream.publish).toHaveBeenCalled();
    });

    it("publishes engagement.xp.earned event", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
        skillTargets: ["multiplication_facts"],
      });

      await service.completeSession(session.id);

      const jetstream = mockApp.nats.jetstream();
      // Should have published at least lesson.completed and engagement.xp.earned
      expect(jetstream.publish).toHaveBeenCalled();
    });

    it("updates database record with masteryAfter and endedAt", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
        skillTargets: ["multiplication_facts"],
      });

      await service.completeSession(session.id);

      expect(mockApp.db.update).toHaveBeenCalled();
    });

    it("removes session from Redis after completion", async () => {
      const session = await service.startSession({
        learnerId: LEARNER_UUID,
        subject: "math",
        sessionType: "LESSON",
      });

      await service.completeSession(session.id);

      expect(mockApp.redis.del).toHaveBeenCalledWith(`session:${session.id}`);
    });
  });

  describe("generateNextRecommendation", () => {
    it("recommends reinforcement for low scores", () => {
      const session = {
        skillTargets: ["multiplication_facts"],
        subject: "math",
        interactions: [
          { correct: false, responseType: "answer", response: {}, timeSpentMs: 1000, timestamp: "" },
          { correct: false, responseType: "answer", response: {}, timeSpentMs: 1000, timestamp: "" },
        ],
      } as never;

      const rec = service.generateNextRecommendation(session);
      expect(rec.reason).toBe("reinforcement_needed");
      expect(rec.type).toBe("LESSON");
    });

    it("recommends quiz for high mastery", () => {
      const session = {
        skillTargets: ["multiplication_facts"],
        subject: "math",
        interactions: [
          { correct: true, responseType: "answer", response: {}, timeSpentMs: 1000, timestamp: "" },
          { correct: true, responseType: "answer", response: {}, timeSpentMs: 1000, timestamp: "" },
        ],
      } as never;

      const rec = service.generateNextRecommendation(session);
      expect(rec.reason).toBe("ready_for_assessment");
      expect(rec.type).toBe("QUIZ");
    });
  });
});
