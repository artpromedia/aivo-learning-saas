import { describe, it, expect, vi, beforeEach } from "vitest";
import { BossAssessmentService } from "../services/boss-assessment.service.js";
import type { BrainContext } from "../plugins/brain-client.js";

function createMockBrainContext(
  functioningLevel: string = "STANDARD",
): BrainContext {
  return {
    learnerId: "learner-1",
    enrolledGrade: 4,
    functioningLevel,
    communicationMode: "VERBAL",
    deliveryLevels: {},
    accommodations: [],
    masteryLevels: {
      math: { counting: 0.8, addition_basic: 0.6 },
    },
    masteryGaps: [],
    iepGoals: [],
    attentionSpanMinutes: 15,
    preferredModality: "visual",
    cognitiveLoad: "MEDIUM",
    activeTutors: [],
  };
}

describe("BossAssessmentService", () => {
  describe("getAssessmentConfig", () => {
    let service: BossAssessmentService;

    beforeEach(() => {
      service = new BossAssessmentService({} as never);
    });

    it("returns 10 adaptive questions for STANDARD", () => {
      const config = service.getAssessmentConfig("STANDARD");
      expect(config.questionCount).toBe(10);
      expect(config.questionType).toBe("adaptive");
      expect(config.includeVisualAids).toBe(false);
      expect(config.partnerAssisted).toBe(false);
      expect(config.parentReported).toBe(false);
    });

    it("returns 7 simplified questions with visual aids for SUPPORTED", () => {
      const config = service.getAssessmentConfig("SUPPORTED");
      expect(config.questionCount).toBe(7);
      expect(config.questionType).toBe("simplified");
      expect(config.includeVisualAids).toBe(true);
    });

    it("returns 5 picture-based, 2-choice for LOW_VERBAL", () => {
      const config = service.getAssessmentConfig("LOW_VERBAL");
      expect(config.questionCount).toBe(5);
      expect(config.questionType).toBe("picture_based");
      expect(config.choiceCount).toBe(2);
      expect(config.includeVisualAids).toBe(true);
    });

    it("returns partner-assisted observation for NON_VERBAL", () => {
      const config = service.getAssessmentConfig("NON_VERBAL");
      expect(config.questionCount).toBe(5);
      expect(config.questionType).toBe("observation");
      expect(config.partnerAssisted).toBe(true);
    });

    it("returns parent-reported milestone check for PRE_SYMBOLIC", () => {
      const config = service.getAssessmentConfig("PRE_SYMBOLIC");
      expect(config.questionCount).toBe(3);
      expect(config.questionType).toBe("milestone_check");
      expect(config.parentReported).toBe(true);
    });
  });

  describe("Assessment Functioning Level Adaptation", () => {
    const levels = ["STANDARD", "SUPPORTED", "LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"] as const;

    it("each functioning level gets a unique assessment config", () => {
      const service = new BossAssessmentService({} as never);
      const configs = levels.map((l) => service.getAssessmentConfig(l));

      // Each should have different question counts or types
      const questionTypes = configs.map((c) => c.questionType);
      expect(new Set(questionTypes).size).toBe(5);
    });

    it("question count decreases with functioning level", () => {
      const service = new BossAssessmentService({} as never);
      const counts = levels.map((l) => service.getAssessmentConfig(l).questionCount);

      // STANDARD(10) >= SUPPORTED(7) >= LOW_VERBAL(5) >= NON_VERBAL(5) >= PRE_SYMBOLIC(3)
      expect(counts[0]).toBeGreaterThanOrEqual(counts[1]);
      expect(counts[1]).toBeGreaterThanOrEqual(counts[2]);
      expect(counts[3]).toBeGreaterThanOrEqual(counts[4]);
    });

    it("visual aids enabled for SUPPORTED and below", () => {
      const service = new BossAssessmentService({} as never);

      expect(service.getAssessmentConfig("STANDARD").includeVisualAids).toBe(false);
      expect(service.getAssessmentConfig("SUPPORTED").includeVisualAids).toBe(true);
      expect(service.getAssessmentConfig("LOW_VERBAL").includeVisualAids).toBe(true);
      expect(service.getAssessmentConfig("NON_VERBAL").includeVisualAids).toBe(true);
    });

    it("partner assistance only for NON_VERBAL", () => {
      const service = new BossAssessmentService({} as never);

      expect(service.getAssessmentConfig("STANDARD").partnerAssisted).toBe(false);
      expect(service.getAssessmentConfig("SUPPORTED").partnerAssisted).toBe(false);
      expect(service.getAssessmentConfig("LOW_VERBAL").partnerAssisted).toBe(false);
      expect(service.getAssessmentConfig("NON_VERBAL").partnerAssisted).toBe(true);
      expect(service.getAssessmentConfig("PRE_SYMBOLIC").partnerAssisted).toBe(false);
    });

    it("parent reporting only for PRE_SYMBOLIC", () => {
      const service = new BossAssessmentService({} as never);

      expect(service.getAssessmentConfig("STANDARD").parentReported).toBe(false);
      expect(service.getAssessmentConfig("SUPPORTED").parentReported).toBe(false);
      expect(service.getAssessmentConfig("PRE_SYMBOLIC").parentReported).toBe(true);
    });
  });
});
