import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionService } from "../services/session.service.js";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */
vi.mock("@aivo/events", () => ({ publishEvent: vi.fn().mockResolvedValue(undefined) }));

vi.mock("@aivo/db", () => ({
  tutorSessions: {
    id: "id",
    learnerId: "learnerId",
    createdAt: "createdAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ _eq: val })),
  desc: vi.fn((col: unknown) => ({ _desc: col })),
}));

const mockBrainContext = {
  learnerId: "l1",
  masteryLevels: {},
  recentTopics: [],
  learningPreferences: {},
  functioningLevel: "STANDARD",
  communicationMode: "VERBAL",
  enrolledGrade: 3,
};

vi.mock("../services/brain-relay.service.js", () => ({
  BrainRelayService: vi.fn().mockImplementation(() => ({
    fetchContext: vi.fn().mockResolvedValue(mockBrainContext),
  })),
}));

/* ------------------------------------------------------------------ */
/*  Mock factory                                                       */
/* ------------------------------------------------------------------ */
function createMockApp() {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
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

describe("SessionService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: SessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new SessionService(app);
  });

  /* ================================================================ */
  /*  startSession                                                     */
  /* ================================================================ */
  describe("startSession", () => {
    it("fetches brain context, inserts record, and publishes event", async () => {
      const { publishEvent } = await import("@aivo/events");
      const fakeSession = {
        id: "sess-1",
        learnerId: "l1",
        tutorSku: "ADDON_TUTOR_MATH",
        subject: "math",
        sessionType: "practice",
        messages: [],
      };

      app.db.returning.mockResolvedValue([fakeSession]);

      const result = await service.startSession("l1", "ADDON_TUTOR_MATH", "math", "practice");

      // Should insert session record with brain context snapshot
      expect(app.db.insert).toHaveBeenCalled();
      expect(app.db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          learnerId: "l1",
          tutorSku: "ADDON_TUTOR_MATH",
          subject: "math",
          sessionType: "practice",
          brainContextSnapshot: mockBrainContext,
          messages: [],
        }),
      );

      // Should publish event
      expect(publishEvent).toHaveBeenCalledWith(app.nats, "tutor.session.started", {
        learnerId: "l1",
        tutorSku: "ADDON_TUTOR_MATH",
        sessionId: "sess-1",
      });

      expect(result).toEqual(fakeSession);
    });
  });

  /* ================================================================ */
  /*  sendMessage                                                      */
  /* ================================================================ */
  describe("sendMessage", () => {
    it("loads session, calls AI, and appends messages", async () => {
      const existingSession = {
        id: "sess-1",
        learnerId: "l1",
        tutorSku: "ADDON_TUTOR_MATH",
        subject: "math",
        messages: [],
        brainContextSnapshot: mockBrainContext,
        masteryUpdates: null,
      };

      // getSession call (select -> from -> where -> limit)
      app.db.limit.mockResolvedValue([existingSession]);

      const result = await service.sendMessage("sess-1", "What is 2+2?");

      // Should call AI with session context
      expect(app.aiClient.tutorRespond).toHaveBeenCalledWith(
        expect.objectContaining({
          learnerId: "l1",
          sessionId: "sess-1",
          subject: "math",
        }),
      );

      // Should update session with both user and assistant messages
      expect(app.db.update).toHaveBeenCalled();
      expect(app.db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "user", content: "What is 2+2?" }),
            expect.objectContaining({ role: "assistant", content: "AI response" }),
          ]),
        }),
      );

      expect(result).toEqual({
        content: "AI response",
        masterySignals: {},
      });
    });

    it("throws 404 if session not found", async () => {
      app.db.limit.mockResolvedValue([]);

      await expect(service.sendMessage("sess-999", "Hello")).rejects.toMatchObject({
        message: "Session not found",
        statusCode: 404,
      });
    });
  });

  /* ================================================================ */
  /*  endSession                                                       */
  /* ================================================================ */
  describe("endSession", () => {
    it("calculates metrics and publishes event", async () => {
      const { publishEvent } = await import("@aivo/events");

      const existingSession = {
        id: "sess-1",
        learnerId: "l1",
        tutorSku: "ADDON_TUTOR_MATH",
        subject: "math",
        startedAt: new Date(Date.now() - 120_000).toISOString(), // 2 minutes ago
        messages: [
          { role: "user", content: "What is 2+2?" },
          { role: "assistant", content: "2+2 equals 4!" },
          { role: "user", content: "Thanks!" },
          { role: "assistant", content: "You're welcome!" },
        ],
        masteryUpdates: { math: 0.8 },
      };

      const updatedSession = { ...existingSession, endedAt: new Date() };

      // getSession (select -> from -> where -> limit)
      app.db.limit.mockResolvedValue([existingSession]);
      // update -> set -> where -> returning
      app.db.returning.mockResolvedValue([updatedSession]);

      const result = await service.endSession("sess-1");

      // Should update with engagement metrics
      expect(app.db.update).toHaveBeenCalled();
      expect(app.db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          endedAt: expect.any(Date),
          engagementMetrics: expect.objectContaining({
            totalMessages: 4,
            userMessages: 2,
            assistantMessages: 2,
            averageResponseLength: expect.any(Number),
          }),
        }),
      );

      // Should publish completion event with mastery updates
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "tutor.session.completed",
        expect.objectContaining({
          learnerId: "l1",
          tutorSku: "ADDON_TUTOR_MATH",
          sessionId: "sess-1",
          masteryUpdates: { math: 0.8 },
          engagementMetrics: expect.objectContaining({
            totalMessages: 4,
            userMessages: 2,
            assistantMessages: 2,
          }),
        }),
      );

      expect(result).toEqual(updatedSession);
    });
  });

  /* ================================================================ */
  /*  getSession                                                       */
  /* ================================================================ */
  describe("getSession", () => {
    it("returns session when found", async () => {
      const fakeSession = { id: "sess-1", learnerId: "l1" };
      app.db.limit.mockResolvedValue([fakeSession]);

      const result = await service.getSession("sess-1");

      expect(result).toEqual(fakeSession);
    });

    it("returns null when session not found", async () => {
      app.db.limit.mockResolvedValue([]);

      const result = await service.getSession("sess-999");

      expect(result).toBeNull();
    });
  });

  /* ================================================================ */
  /*  getHistory                                                       */
  /* ================================================================ */
  describe("getHistory", () => {
    it("returns sessions ordered by createdAt descending with default limit", async () => {
      const sessions = [
        { id: "sess-2", learnerId: "l1" },
        { id: "sess-1", learnerId: "l1" },
      ];
      app.db.limit.mockResolvedValue(sessions);

      const result = await service.getHistory("l1");

      expect(app.db.select).toHaveBeenCalled();
      expect(app.db.orderBy).toHaveBeenCalled();
      expect(app.db.limit).toHaveBeenCalledWith(20);
      expect(result).toEqual(sessions);
    });
  });
});
