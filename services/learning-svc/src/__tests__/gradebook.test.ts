import { describe, it, expect, vi, beforeEach } from "vitest";
import { GradebookService } from "../services/gradebook.service.js";
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
      math: { addition_basic: 0.95, multiplication_facts: 0.65, fractions_intro: 0.3 },
      reading: { main_idea: 0.8, inference: 0.45 },
    },
    masteryGaps: [],
    iepGoals: [
      { id: "g1", text: "Improve math computation", domain: "math", targetDate: "2026-06-01" },
    ],
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
    },
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  };
}

describe("GradebookService", () => {
  describe("getMasteryLabel", () => {
    let service: GradebookService;

    beforeEach(() => {
      const mockApp = createMockApp();
      service = new GradebookService(mockApp as never);
    });

    it("returns Mastered for >=80%", () => {
      expect(service.getMasteryLabel(80)).toEqual({
        percentage: 80,
        label: "Mastered",
        indicator: "star",
      });
      expect(service.getMasteryLabel(100)).toEqual({
        percentage: 100,
        label: "Mastered",
        indicator: "star",
      });
    });

    it("returns Approaching for 60-79%", () => {
      expect(service.getMasteryLabel(60)).toEqual({
        percentage: 60,
        label: "Approaching",
        indicator: "green",
      });
      expect(service.getMasteryLabel(79)).toEqual({
        percentage: 79,
        label: "Approaching",
        indicator: "green",
      });
    });

    it("returns Developing for 40-59%", () => {
      expect(service.getMasteryLabel(40)).toEqual({
        percentage: 40,
        label: "Developing",
        indicator: "yellow",
      });
    });

    it("returns Beginning for 0-39%", () => {
      expect(service.getMasteryLabel(0)).toEqual({
        percentage: 0,
        label: "Beginning",
        indicator: "red",
      });
      expect(service.getMasteryLabel(39)).toEqual({
        percentage: 39,
        label: "Beginning",
        indicator: "red",
      });
    });
  });

  describe("getSummary", () => {
    it("returns per-subject mastery summaries", async () => {
      const mockApp = createMockApp();
      const service = new GradebookService(mockApp as never);
      const summary = await service.getSummary("learner-1");

      expect(summary.learnerId).toBe("learner-1");
      expect(summary.subjects.length).toBe(2); // math, reading

      const math = summary.subjects.find((s) => s.subject === "math");
      expect(math).toBeDefined();
      expect(math!.skills.length).toBe(3);
    });

    it("calculates correct overall mastery for a subject", async () => {
      const mockApp = createMockApp();
      const service = new GradebookService(mockApp as never);
      const summary = await service.getSummary("learner-1");

      const math = summary.subjects.find((s) => s.subject === "math")!;
      // (0.95 + 0.65 + 0.3) / 3 * 100 ≈ 63.33
      expect(math.overallMastery).toBeCloseTo(63.33, 0);
    });

    it("returns functional milestones for LOW_VERBAL", async () => {
      const lowVerbalContext = createMockBrainContext({
        functioningLevel: "LOW_VERBAL",
        iepGoals: [
          { id: "g1", text: "Express needs", domain: "COMMUNICATION", targetDate: "2026-06-01" },
          { id: "g2", text: "Self-feeding", domain: "SELF_CARE", targetDate: "2026-06-01" },
        ],
      });
      const mockApp = createMockApp(lowVerbalContext);
      const service = new GradebookService(mockApp as never);
      const summary = await service.getSummary("learner-1");

      expect(summary.functionalMilestones).toBeDefined();
      expect(summary.functionalMilestones!.length).toBe(5); // 5 domains
      expect(summary.functionalMilestones!.some((m) => m.domain === "COMMUNICATION")).toBe(true);
    });

    it("does NOT include functional milestones for STANDARD", async () => {
      const mockApp = createMockApp();
      const service = new GradebookService(mockApp as never);
      const summary = await service.getSummary("learner-1");

      expect(summary.functionalMilestones).toBeUndefined();
    });

    it("returns functional milestones for NON_VERBAL", async () => {
      const context = createMockBrainContext({ functioningLevel: "NON_VERBAL" });
      const mockApp = createMockApp(context);
      const service = new GradebookService(mockApp as never);
      const summary = await service.getSummary("learner-1");

      expect(summary.functionalMilestones).toBeDefined();
    });

    it("returns functional milestones for PRE_SYMBOLIC", async () => {
      const context = createMockBrainContext({ functioningLevel: "PRE_SYMBOLIC" });
      const mockApp = createMockApp(context);
      const service = new GradebookService(mockApp as never);
      const summary = await service.getSummary("learner-1");

      expect(summary.functionalMilestones).toBeDefined();
    });
  });

  describe("getSkillDetail", () => {
    it("returns skill mastery with history", async () => {
      const mockApp = createMockApp();
      const service = new GradebookService(mockApp as never);
      const detail = await service.getSkillDetail("learner-1", "math", "addition_basic");

      expect(detail.skill).toBe("addition_basic");
      expect(detail.mastery).toBeCloseTo(95, 0);
      expect(detail.label).toBe("Mastered");
    });

    it("includes IEP goal alignment", async () => {
      const mockApp = createMockApp();
      const service = new GradebookService(mockApp as never);
      const detail = await service.getSkillDetail("learner-1", "math", "multiplication_facts");

      expect(detail.iepGoalAlignment).toBeDefined();
      expect(detail.iepGoalAlignment.length).toBeGreaterThanOrEqual(0);
    });
  });
});
