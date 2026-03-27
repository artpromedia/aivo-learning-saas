import { describe, it, expect, vi, beforeEach } from "vitest";
import { HomeworkSessionService } from "../services/homework-session.service.js";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */
vi.mock("@aivo/events", () => ({ publishEvent: vi.fn().mockResolvedValue(undefined) }));

vi.mock("@aivo/db", () => ({
  homeworkSessions: {
    id: "id",
    learnerId: "learnerId",
    homeworkAssignmentId: "homeworkAssignmentId",
  },
  homeworkAssignments: {
    id: "id",
    learnerId: "learnerId",
    subject: "subject",
  },
  learners: {
    id: "id",
    functioningLevel: "functioningLevel",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ _eq: val })),
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

describe("HomeworkSessionService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: HomeworkSessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new HomeworkSessionService(app);
  });

  /* ================================================================ */
  /*  startSession                                                     */
  /* ================================================================ */
  describe("startSession", () => {
    it("loads assignment, fetches brain context, creates session, and publishes event", async () => {
      const { publishEvent } = await import("@aivo/events");

      const fakeAssignment = {
        id: "hw-1",
        learnerId: "l1",
        subject: "math",
        adaptedProblems: [{ text: "What is 3+4?" }],
        homeworkMode: "PRACTICE",
      };

      const fakeLearner = { id: "l1", functioningLevel: "STANDARD" };

      const fakeSession = {
        id: "hwsess-1",
        homeworkAssignmentId: "hw-1",
        learnerId: "l1",
        tutorSku: "ADDON_TUTOR_MATH",
        messages: [],
      };

      // First limit call: load assignment
      // Second limit call: load learner
      let limitCallCount = 0;
      app.db.limit.mockImplementation(() => {
        limitCallCount++;
        if (limitCallCount === 1) return Promise.resolve([fakeAssignment]);
        if (limitCallCount === 2) return Promise.resolve([fakeLearner]);
        return Promise.resolve([]);
      });

      // insert -> values -> returning for session creation
      app.db.returning.mockResolvedValue([fakeSession]);

      const result = await service.startSession("hw-1", "l1");

      // Should insert session record
      expect(app.db.insert).toHaveBeenCalled();
      expect(app.db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          homeworkAssignmentId: "hw-1",
          learnerId: "l1",
          tutorSku: "ADDON_TUTOR_MATH",
          messages: [],
        }),
      );

      // Should update assignment status to IN_PROGRESS
      expect(app.db.update).toHaveBeenCalled();
      expect(app.db.set).toHaveBeenCalledWith({ status: "IN_PROGRESS" });

      // Should publish event
      expect(publishEvent).toHaveBeenCalledWith(app.nats, "homework.session.started", {
        learnerId: "l1",
        assignmentId: "hw-1",
        sessionId: "hwsess-1",
      });

      expect(result).toEqual(fakeSession);
    });

    it("throws 404 when assignment is not found", async () => {
      app.db.limit.mockResolvedValue([]);

      await expect(service.startSession("hw-999", "l1")).rejects.toMatchObject({
        message: "Assignment not found",
        statusCode: 404,
      });
    });
  });

  /* ================================================================ */
  /*  sendMessage                                                      */
  /* ================================================================ */
  describe("sendMessage", () => {
    it("loads session and assignment, calls AI, and appends messages", async () => {
      const existingSession = {
        id: "hwsess-1",
        homeworkAssignmentId: "hw-1",
        learnerId: "l1",
        tutorSku: "ADDON_TUTOR_MATH",
        messages: [],
      };

      const fakeAssignment = {
        id: "hw-1",
        subject: "math",
        adaptedProblems: [{ text: "What is 3+4?" }],
        homeworkMode: "PRACTICE",
      };

      // First limit call: getSession (private)
      // Second limit call: load assignment
      let limitCallCount = 0;
      app.db.limit.mockImplementation(() => {
        limitCallCount++;
        if (limitCallCount === 1) return Promise.resolve([existingSession]);
        if (limitCallCount === 2) return Promise.resolve([fakeAssignment]);
        return Promise.resolve([]);
      });

      // update call chain

      const result = await service.sendMessage("hwsess-1", "I think the answer is 7");

      // Should call AI tutor with assignment context
      expect(app.aiClient.tutorRespond).toHaveBeenCalledWith(
        expect.objectContaining({
          learnerId: "l1",
          sessionId: "hwsess-1",
          subject: "math",
          brainContext: {
            adaptedProblems: [{ text: "What is 3+4?" }],
            homeworkMode: "PRACTICE",
          },
        }),
      );

      // Should update session with both user and assistant messages
      expect(app.db.update).toHaveBeenCalled();
      expect(app.db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "user", content: "I think the answer is 7" }),
            expect.objectContaining({ role: "assistant", content: "AI response" }),
          ]),
          hintsUsed: 1, // 1 assistant message
        }),
      );

      expect(result).toEqual({ content: "AI response" });
    });

    it("throws 404 if homework session not found", async () => {
      app.db.limit.mockResolvedValue([]);

      await expect(service.sendMessage("hwsess-999", "Hello")).rejects.toMatchObject({
        message: "Homework session not found",
        statusCode: 404,
      });
    });

    it("throws 404 if assignment not found for the session", async () => {
      const existingSession = {
        id: "hwsess-1",
        homeworkAssignmentId: "hw-missing",
        learnerId: "l1",
        messages: [],
      };

      // First limit: session found; second limit: assignment not found
      let limitCallCount = 0;
      app.db.limit.mockImplementation(() => {
        limitCallCount++;
        if (limitCallCount === 1) return Promise.resolve([existingSession]);
        return Promise.resolve([]);
      });

      await expect(service.sendMessage("hwsess-1", "Hello")).rejects.toMatchObject({
        message: "Assignment not found",
        statusCode: 404,
      });
    });
  });

  /* ================================================================ */
  /*  endSession                                                       */
  /* ================================================================ */
  describe("endSession", () => {
    it("calculates completion quality, updates session and assignment, publishes event", async () => {
      const { publishEvent } = await import("@aivo/events");

      const existingSession = {
        id: "hwsess-1",
        homeworkAssignmentId: "hw-1",
        learnerId: "l1",
        tutorSku: "ADDON_TUTOR_MATH",
        startedAt: new Date(Date.now() - 300_000).toISOString(), // 5 minutes ago
        messages: [
          { role: "user", content: "Is it 7?" },
          { role: "assistant", content: "Yes, correct!" },
        ],
        problemsCompleted: 3,
        problemsAttempted: 4,
        hintsUsed: 2,
      };

      const fakeAssignment = {
        id: "hw-1",
        subject: "math",
        adaptedProblems: [
          { text: "3+4=?" },
          { text: "5+6=?" },
          { text: "2+3=?" },
          { text: "7+1=?" },
          { text: "9+2=?" },
        ],
        homeworkMode: "PRACTICE",
      };

      const updatedSession = { ...existingSession, endedAt: new Date(), completionQuality: "0.5" };

      // First limit: getSession; second limit: load assignment
      let limitCallCount = 0;
      app.db.limit.mockImplementation(() => {
        limitCallCount++;
        if (limitCallCount === 1) return Promise.resolve([existingSession]);
        if (limitCallCount === 2) return Promise.resolve([fakeAssignment]);
        return Promise.resolve([]);
      });

      // update -> set -> where -> returning for session update
      app.db.returning.mockResolvedValue([updatedSession]);
      // second update for assignment status (returns on where)

      const result = await service.endSession("hwsess-1");

      // Completion quality: base = 3/5 = 0.6, penalty = 2*0.05 = 0.1, final = 0.5
      expect(app.db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          endedAt: expect.any(Date),
          durationSeconds: expect.any(Number),
          completionQuality: "0.5",
          problemsAttempted: 4,
          problemsCompleted: 3,
        }),
      );

      // Should update assignment status to COMPLETED
      expect(app.db.set).toHaveBeenCalledWith({ status: "COMPLETED" });

      // Should publish completion event
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "homework.session.completed",
        expect.objectContaining({
          learnerId: "l1",
          assignmentId: "hw-1",
          sessionId: "hwsess-1",
          subject: "math",
          completionQuality: 0.5,
          problemsCompleted: 3,
          hintsUsed: 2,
          durationSeconds: expect.any(Number),
        }),
      );

      expect(result).toEqual(updatedSession);
    });

    it("handles zero total problems gracefully (quality = 0)", async () => {
      const existingSession = {
        id: "hwsess-1",
        homeworkAssignmentId: "hw-1",
        learnerId: "l1",
        startedAt: new Date(Date.now() - 60_000).toISOString(),
        messages: [],
        problemsCompleted: 0,
        problemsAttempted: 0,
        hintsUsed: 0,
      };

      const fakeAssignment = {
        id: "hw-1",
        subject: "math",
        adaptedProblems: [], // no problems
      };

      let limitCallCount = 0;
      app.db.limit.mockImplementation(() => {
        limitCallCount++;
        if (limitCallCount === 1) return Promise.resolve([existingSession]);
        if (limitCallCount === 2) return Promise.resolve([fakeAssignment]);
        return Promise.resolve([]);
      });

      app.db.returning.mockResolvedValue([{ ...existingSession, endedAt: new Date() }]);

      await service.endSession("hwsess-1");

      expect(app.db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          completionQuality: "0",
        }),
      );
    });

    it("throws 404 if homework session not found", async () => {
      app.db.limit.mockResolvedValue([]);

      await expect(service.endSession("hwsess-999")).rejects.toMatchObject({
        message: "Homework session not found",
        statusCode: 404,
      });

      // Should not attempt any updates or publish events
      expect(app.db.update).not.toHaveBeenCalled();
    });
  });
});
