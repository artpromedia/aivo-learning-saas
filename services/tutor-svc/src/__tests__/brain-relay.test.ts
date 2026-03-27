import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrainRelayService } from "../services/brain-relay.service.js";

vi.mock("@aivo/db", () => ({
  learners: { id: "id", functioningLevel: "functioningLevel", communicationMode: "communicationMode", enrolledGrade: "enrolledGrade" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ _eq: val })),
}));

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(),
    },
    brainClient: {
      getBrainContext: vi.fn().mockResolvedValue({
        masteryLevels: { MATH: 0.7 },
        recentTopics: ["fractions"],
        learningPreferences: { modality: "visual" },
      }),
    },
  } as any;
}

describe("BrainRelayService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: BrainRelayService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new BrainRelayService(app);
  });

  describe("fetchContext", () => {
    it("combines brain-svc data with learner profile", async () => {
      app.db.limit.mockResolvedValue([{
        functioningLevel: "SUPPORTED",
        communicationMode: "LIMITED_VERBAL",
        enrolledGrade: 3,
      }]);

      const ctx = await service.fetchContext("learner-1");
      expect(ctx.learnerId).toBe("learner-1");
      expect(ctx.masteryLevels).toEqual({ MATH: 0.7 });
      expect(ctx.functioningLevel).toBe("SUPPORTED");
      expect(ctx.enrolledGrade).toBe(3);
    });

    it("defaults when learner not found", async () => {
      app.db.limit.mockResolvedValue([]);

      const ctx = await service.fetchContext("learner-missing");
      expect(ctx.functioningLevel).toBe("STANDARD");
      expect(ctx.communicationMode).toBe("VERBAL");
      expect(ctx.enrolledGrade).toBeNull();
    });
  });

  describe("adaptForFunctioningLevel", () => {
    const baseContext = {
      learnerId: "l1",
      masteryLevels: {},
      recentTopics: [],
      learningPreferences: {},
      functioningLevel: "STANDARD",
      communicationMode: "VERBAL",
      enrolledGrade: 3,
    };

    it("returns minimal scaffolding for STANDARD", () => {
      const adapted = service.adaptForFunctioningLevel(baseContext, "STANDARD");
      expect(adapted.sessionParameters.scaffoldingLevel).toBe("minimal");
      expect(adapted.sessionParameters.parentInvolvementRequired).toBe(false);
    });

    it("returns high scaffolding for LOW_VERBAL", () => {
      const adapted = service.adaptForFunctioningLevel(baseContext, "LOW_VERBAL");
      expect(adapted.sessionParameters.scaffoldingLevel).toBe("high");
      expect(adapted.sessionParameters.parentInvolvementRequired).toBe(true);
      expect(adapted.sessionParameters.simplifiedLanguage).toBe(true);
    });

    it("returns maximum scaffolding for PRE_SYMBOLIC", () => {
      const adapted = service.adaptForFunctioningLevel(baseContext, "PRE_SYMBOLIC");
      expect(adapted.sessionParameters.scaffoldingLevel).toBe("maximum");
      expect(adapted.sessionParameters.maxResponseLength).toBe(80);
    });

    it("defaults to STANDARD for unknown level", () => {
      const adapted = service.adaptForFunctioningLevel(baseContext, "UNKNOWN");
      expect(adapted.sessionParameters.scaffoldingLevel).toBe("minimal");
    });

    it("includes original context fields", () => {
      const adapted = service.adaptForFunctioningLevel(baseContext, "SUPPORTED");
      expect(adapted.learnerId).toBe("l1");
      expect(adapted.enrolledGrade).toBe(3);
    });
  });
});
