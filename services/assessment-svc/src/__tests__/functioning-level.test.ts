import { describe, it, expect } from "vitest";
import { scoreFunctioningLevel } from "../services/functioning-level.service.js";

describe("scoreFunctioningLevel", () => {
  it("returns STANDARD for highly communicative learner", () => {
    const result = scoreFunctioningLevel({
      comm_verbal: "Verbal speech",
      comm_complexity: "Complex sentences",
      sensory_visual: 5,
      sensory_audio: 5,
      sensory_preferences: [],
      learn_attention: "30+ minutes",
      interests: ["Science"],
      motivators: "Earning rewards/tokens",
    });

    expect(result.overallLevel).toBe("STANDARD");
    expect(result.initialTheta).toBeGreaterThan(0);
    expect(result.assessmentMode).toBe("STANDARD");
  });

  it("returns SUPPORTED for moderately communicative learner", () => {
    const result = scoreFunctioningLevel({
      comm_verbal: "Combination of methods",
      comm_complexity: "Simple sentences",
      sensory_visual: 3,
      sensory_audio: 3,
      sensory_preferences: ["Visual schedules"],
      learn_attention: "10-20 minutes",
    });

    expect(result.overallLevel).toBe("SUPPORTED");
    expect(result.assessmentMode).toBe("MODIFIED");
  });

  it("returns LOW_VERBAL for limited communication learner", () => {
    const result = scoreFunctioningLevel({
      comm_verbal: "AAC device",
      comm_complexity: "2-3 word phrases",
      sensory_visual: 3,
      sensory_audio: 3,
      sensory_preferences: ["Dim lighting"],
      learn_attention: "5-10 minutes",
    });

    expect(result.overallLevel).toBe("LOW_VERBAL");
    expect(result.assessmentMode).toBe("PICTURE_BASED");
  });

  it("returns NON_VERBAL for gestural communication learner", () => {
    const result = scoreFunctioningLevel({
      comm_verbal: "Gestures and pointing",
      comm_complexity: "Single words",
      sensory_visual: 2,
      sensory_audio: 2,
      sensory_preferences: ["Dim lighting", "Noise-canceling headphones"],
      learn_attention: "Less than 5 minutes",
    });

    expect(result.overallLevel).toBe("NON_VERBAL");
    expect(result.assessmentMode).toBe("PARTNER_ASSISTED");
  });

  it("returns PRE_SYMBOLIC for minimal communication", () => {
    const result = scoreFunctioningLevel({
      comm_verbal: "Gestures and pointing",
      comm_complexity: "Single words",
      sensory_visual: 1,
      sensory_audio: 1,
      sensory_preferences: ["Dim lighting", "Noise-canceling headphones", "Fidget tools", "Weighted blanket", "Visual schedules", "Quiet space"],
      learn_attention: "Less than 5 minutes",
    });

    expect(result.overallLevel).toBe("PRE_SYMBOLIC");
    expect(result.assessmentMode).toBe("OBSERVATIONAL");
    expect(result.initialTheta).toBeLessThan(-1);
  });

  it("handles missing fields with sensible defaults", () => {
    const result = scoreFunctioningLevel({});
    expect(result.overallLevel).toBeDefined();
    expect(result.communicationScore).toBeGreaterThanOrEqual(0);
    expect(result.sensoryScore).toBeGreaterThanOrEqual(0);
    expect(result.learningScore).toBeGreaterThanOrEqual(0);
  });
});
