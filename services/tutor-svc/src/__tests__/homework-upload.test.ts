import { describe, it, expect, vi, beforeEach } from "vitest";
import { HomeworkUploadService } from "../services/homework-upload.service.js";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */
vi.mock("@aivo/events", () => ({ publishEvent: vi.fn().mockResolvedValue(undefined) }));

vi.mock("@aivo/db", () => ({
  homeworkAssignments: {
    id: "id",
    learnerId: "learnerId",
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

const mockGate = {
  verifyAccess: vi.fn(),
};

vi.mock("../services/subscription-gate.service.js", () => ({
  SubscriptionGateService: vi.fn().mockImplementation(() => mockGate),
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

describe("HomeworkUploadService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: HomeworkUploadService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new HomeworkUploadService(app);
  });

  /* ================================================================ */
  /*  upload                                                           */
  /* ================================================================ */
  describe("upload", () => {
    it("performs OCR, gates, adapts, and creates assignment", async () => {
      const { publishEvent } = await import("@aivo/events");

      mockGate.verifyAccess.mockResolvedValue({ allowed: true, sku: "ADDON_TUTOR_MATH" });

      const fakeLearner = { id: "l1", functioningLevel: "STANDARD" };
      const fakeAssignment = {
        id: "hw-1",
        learnerId: "l1",
        subject: "math",
        status: "READY",
      };

      // learner query returns on limit()
      app.db.limit.mockResolvedValue([fakeLearner]);
      // assignment insert returns on returning()
      app.db.returning.mockResolvedValue([fakeAssignment]);

      const result = await service.upload("l1", "https://example.com/photo.jpg", "image/jpeg");

      // Step 1: OCR extraction
      expect(app.aiClient.homeworkOCR).toHaveBeenCalledWith({
        learnerId: "l1",
        imageUrl: "https://example.com/photo.jpg",
        mimeType: "image/jpeg",
      });

      // Step 2: Gate check with detected subject
      expect(mockGate.verifyAccess).toHaveBeenCalledWith("l1", "math");

      // Step 5: Adapt with brain context
      expect(app.aiClient.homeworkAdapt).toHaveBeenCalledWith(
        expect.objectContaining({
          learnerId: "l1",
          problems: [{ text: "3+4=?" }],
          brainContext: mockBrainContext,
        }),
      );

      // Step 6: Create assignment record
      expect(app.db.insert).toHaveBeenCalled();
      expect(app.db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          learnerId: "l1",
          subject: "math",
          originalFileUrl: "https://example.com/photo.jpg",
          originalFileType: "image/jpeg",
          extractedText: "3+4=?",
          extractedProblems: [{ text: "3+4=?" }],
          adaptedProblems: [{ text: "What is 3+4?" }],
          homeworkMode: "PRACTICE",
          status: "READY",
        }),
      );

      // Step 7: Publish events
      expect(publishEvent).toHaveBeenCalledWith(app.nats, "homework.uploaded", expect.objectContaining({
        learnerId: "l1",
        assignmentId: "hw-1",
        subject: "math",
        fileUrl: "https://example.com/photo.jpg",
      }));
      expect(publishEvent).toHaveBeenCalledWith(app.nats, "homework.processed", expect.objectContaining({
        learnerId: "l1",
        assignmentId: "hw-1",
        problemCount: 1,
      }));

      expect(result).toEqual(fakeAssignment);
    });

    it("throws 403 when subscription gate denies access", async () => {
      mockGate.verifyAccess.mockResolvedValue({
        allowed: false,
        requiredSku: "ADDON_TUTOR_MATH",
        message: "Access denied",
      });

      await expect(
        service.upload("l1", "https://example.com/photo.jpg", "image/jpeg"),
      ).rejects.toMatchObject({
        message: "Access denied",
        statusCode: 403,
        requiredSku: "ADDON_TUTOR_MATH",
      });

      // Should NOT proceed to adapt or create
      expect(app.aiClient.homeworkAdapt).not.toHaveBeenCalled();
      expect(app.db.insert).not.toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  getAssignment                                                    */
  /* ================================================================ */
  describe("getAssignment", () => {
    it("returns assignment when found", async () => {
      const fakeAssignment = { id: "hw-1", learnerId: "l1", subject: "math" };
      app.db.limit.mockResolvedValue([fakeAssignment]);

      const result = await service.getAssignment("hw-1");

      expect(result).toEqual(fakeAssignment);
    });

    it("returns null when assignment not found", async () => {
      app.db.limit.mockResolvedValue([]);

      const result = await service.getAssignment("hw-999");

      expect(result).toBeNull();
    });
  });
});
