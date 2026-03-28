import { describe, it, expect, vi, beforeEach } from "vitest";
import { HomeworkService } from "../services/homework.service.js";

vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@aivo/db", () => ({
  homeworkAssignments: {
    id: "id",
    learnerId: "learnerId",
    status: "status",
    subject: "subject",
    adaptedProblems: "adaptedProblems",
  },
  homeworkSessions: {
    id: "id",
    homeworkAssignmentId: "homeworkAssignmentId",
    learnerId: "learnerId",
    messages: "messages",
    hintsUsed: "hintsUsed",
    problemsAttempted: "problemsAttempted",
    problemsCompleted: "problemsCompleted",
  },
  learners: {
    id: "id",
    functioningLevel: "functioningLevel",
    communicationMode: "communicationMode",
    enrolledGrade: "enrolledGrade",
    name: "name",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ _eq: val })),
  and: vi.fn((...args: unknown[]) => ({ _and: args })),
  desc: vi.fn((col: unknown) => ({ _desc: col })),
}));

const mockBrainContext = {
  learnerId: "learner-1",
  masteryLevels: { math: 0.6 },
  recentTopics: ["addition"],
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

const mockGate = {
  verifyAccess: vi.fn(),
};

vi.mock("../services/subscription-gate.service.js", () => ({
  SubscriptionGateService: vi.fn().mockImplementation(() => mockGate),
}));

vi.mock("../services/storage-backend.service.js", () => ({
  getStorageBackend: vi.fn().mockReturnValue({
    upload: vi.fn().mockResolvedValue({
      key: "test-key.jpg",
      url: "/uploads/homework/test-key.jpg",
      size: 1024,
    }),
  }),
}));

function createMockApp() {
  const chain = () => ({
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
  });

  const db = chain();

  return {
    db,
    nats: { jetstream: vi.fn().mockReturnValue({ publish: vi.fn() }) },
    aiClient: {
      visionExtract: vi.fn().mockResolvedValue({
        raw_text: "1) What is 2 + 3?\n2) Solve: 5x = 25",
        detected_subject: { subject: "MATH", confidence: 0.9 },
        problems: [
          { number: 1, text: "What is 2 + 3?", type: "EQUATION" },
          { number: 2, text: "Solve: 5x = 25", type: "EQUATION" },
        ],
      }),
      homeworkAdaptFull: vi.fn().mockResolvedValue({
        adapted_problems: [
          {
            problem_number: 1,
            original: "What is 2 + 3?",
            adapted: "Let's figure out 2 + 3 together!",
            scaffolding: "Count on your fingers: start at 2, count 3 more",
          },
          {
            problem_number: 2,
            original: "Solve: 5x = 25",
            adapted: "What number times 5 equals 25?",
            scaffolding: "Think: 5 x ? = 25",
          },
        ],
        parent_guide: "",
        estimated_minutes: 10,
      }),
      tutorRespond: vi.fn().mockResolvedValue({
        content: "Great job! You got 2 + 3 = 5. Let's move to problem 2.",
      }),
    },
    brainClient: {
      getBrainContext: vi.fn().mockResolvedValue(mockBrainContext),
    },
  } as any;
}

describe("HomeworkService — Full Pipeline", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: HomeworkService;

  beforeEach(() => {
    app = createMockApp();
    service = new HomeworkService(app);
    mockGate.verifyAccess.mockResolvedValue({ allowed: true, sku: "ADDON_TUTOR_MATH" });
    vi.clearAllMocks();
  });

  describe("uploadAndProcess", () => {
    it("should complete the full upload → OCR → adapt pipeline", async () => {
      const mockAssignment = {
        id: "assignment-1",
        learnerId: "learner-1",
        subject: "math",
        status: "READY",
        adaptedProblems: [],
      };

      // Mock DB select for learner
      app.db.limit.mockResolvedValueOnce([
        {
          id: "learner-1",
          functioningLevel: "STANDARD",
          communicationMode: "VERBAL",
          enrolledGrade: 3,
        },
      ]);

      // Mock DB insert returning
      app.db.returning.mockResolvedValueOnce([mockAssignment]);

      mockGate.verifyAccess.mockResolvedValue({ allowed: true, sku: "ADDON_TUTOR_MATH" });

      const result = await service.uploadAndProcess(
        "learner-1",
        Buffer.from("fake-image-data"),
        "homework.jpg",
        "image/jpeg",
      );

      expect(result.locked).toBeUndefined();
      expect(result.assignment).toBeTruthy();
      expect(app.aiClient.visionExtract).toHaveBeenCalled();
      expect(app.aiClient.homeworkAdaptFull).toHaveBeenCalled();
    });

    it("should return locked when subscription gate fails", async () => {
      mockGate.verifyAccess.mockResolvedValue({
        allowed: false,
        requiredSku: "ADDON_TUTOR_MATH",
        message: "Subscription required",
      });

      const mockAssignment = {
        id: "assignment-1",
        status: "FAILED",
      };
      app.db.returning.mockResolvedValueOnce([mockAssignment]);

      const result = await service.uploadAndProcess(
        "learner-1",
        Buffer.from("fake-image-data"),
        "homework.jpg",
        "image/jpeg",
      );

      expect(result.locked).toBe(true);
      expect(result.requiredSku).toBe("ADDON_TUTOR_MATH");
    });
  });

  describe("startSession", () => {
    it("should create a session with Socratic first prompt", async () => {
      const mockAssignment = {
        id: "assignment-1",
        subject: "math",
        adaptedProblems: [{ problem_number: 1 }, { problem_number: 2 }],
      };
      const mockSession = {
        id: "session-1",
        homeworkAssignmentId: "assignment-1",
        learnerId: "learner-1",
      };

      // Assignment query
      app.db.limit
        .mockResolvedValueOnce([mockAssignment]) // assignment query
        .mockResolvedValueOnce([{ // learner query
          id: "learner-1",
          functioningLevel: "STANDARD",
          communicationMode: "VERBAL",
          enrolledGrade: 3,
          name: "Alice",
        }]);

      // Insert session
      app.db.returning.mockResolvedValueOnce([mockSession]);

      mockGate.verifyAccess.mockResolvedValue({ allowed: true });

      const result = await service.startSession("assignment-1", "learner-1");

      expect(result.session).toBeTruthy();
      expect(result.firstPrompt).toContain("Alice");
      expect(result.firstPrompt).toContain("math");
      expect(result.firstPrompt).toContain("2 problems");
    });
  });

  describe("sendMessage", () => {
    it("should process a message and track progress", async () => {
      const mockSession = {
        id: "session-1",
        homeworkAssignmentId: "assignment-1",
        learnerId: "learner-1",
        messages: [
          { role: "assistant", content: "Let's start with problem 1!" },
        ],
        startedAt: new Date(),
        hintsUsed: 1,
        problemsAttempted: 0,
        problemsCompleted: 0,
      };
      const mockAssignment = {
        id: "assignment-1",
        subject: "math",
        adaptedProblems: [{ problem_number: 1 }, { problem_number: 2 }],
        homeworkMode: "PRACTICE",
      };

      // Session query
      app.db.limit
        .mockResolvedValueOnce([mockSession]) // session
        .mockResolvedValueOnce([mockAssignment]); // assignment

      const result = await service.sendMessage("session-1", "Is the answer 5?");

      expect(result.content).toBeTruthy();
      expect(result.problemProgress).toBeDefined();
      expect(app.aiClient.tutorRespond).toHaveBeenCalled();
    });
  });

  describe("endSession", () => {
    it("should calculate completion quality and publish metrics", async () => {
      const startTime = new Date(Date.now() - 600000); // 10 min ago
      const mockSession = {
        id: "session-1",
        homeworkAssignmentId: "assignment-1",
        learnerId: "learner-1",
        startedAt: startTime,
        problemsCompleted: 2,
        problemsAttempted: 2,
        hintsUsed: 3,
      };
      const mockAssignment = {
        id: "assignment-1",
        adaptedProblems: [{ problem_number: 1 }, { problem_number: 2 }],
        subject: "math",
      };
      const mockUpdated = {
        ...mockSession,
        endedAt: new Date(),
        completionQuality: "0.85",
        durationSeconds: 600,
      };

      // Session query, then assignment query
      app.db.limit
        .mockResolvedValueOnce([mockSession])
        .mockResolvedValueOnce([mockAssignment]);

      // Update session returning
      app.db.returning.mockResolvedValueOnce([mockUpdated]);

      const result = await service.endSession("session-1");

      expect(result).toBeTruthy();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalProblems).toBe(2);
      expect(result.summary.problemsCompleted).toBe(2);
    });
  });
});
