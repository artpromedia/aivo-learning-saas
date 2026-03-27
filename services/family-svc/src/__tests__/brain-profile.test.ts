import { describe, it, expect, vi } from "vitest";
import { BrainProfileService } from "../services/brain-profile.service.js";

const LEARNER_ID = "b0000000-0000-4000-a000-000000000001";

function createMockApp() {
  return {
    brainClient: {
      getContext: vi.fn().mockResolvedValue({
        learnerId: LEARNER_ID,
        enrolledGrade: 6,
        functioningLevel: "SUPPORTED",
        communicationMode: "LIMITED_VERBAL",
        deliveryLevels: { math: "grade_5", reading: "grade_4" },
        accommodations: ["extended_time", "visual_aids"],
        masteryLevels: {
          math: { addition: 0.9, subtraction: 0.85, multiplication: 0.6, division: 0.4 },
          reading: { main_idea: 0.7, vocabulary: 0.5 },
        },
        iepGoals: [],
        attentionSpanMinutes: 15,
        preferredModality: "visual",
        cognitiveLoad: "MEDIUM",
        mainBrainVersion: "3.0",
        lastUpdated: "2026-03-26T10:00:00Z",
        activeTutors: [],
      }),
      getFunctioningLevelHistory: vi.fn().mockResolvedValue([
        { level: "NON_VERBAL", setAt: "2026-01-15", trigger: "initial_clone" },
        { level: "LOW_VERBAL", setAt: "2026-02-15", trigger: "parent_approved" },
        { level: "SUPPORTED", setAt: "2026-03-01", trigger: "parent_approved" },
      ]),
      getAccommodations: vi.fn().mockResolvedValue(["extended_time", "visual_aids", "text_to_speech"]),
      getSnapshots: vi.fn().mockResolvedValue([
        { id: "s1", trigger: "INITIAL_CLONE", versionNumber: 1, createdAt: "2026-01-15T00:00:00Z" },
        { id: "s2", trigger: "PARENT_APPROVED", versionNumber: 2, createdAt: "2026-02-15T00:00:00Z" },
      ]),
    },
  };
}

describe("BrainProfileService", () => {
  describe("getProfile", () => {
    it("returns Brain profile summary with mastery overview", async () => {
      const mockApp = createMockApp();
      const service = new BrainProfileService(mockApp as never);
      const profile = await service.getProfile(LEARNER_ID);

      expect(profile.learnerId).toBe(LEARNER_ID);
      expect(profile.version).toBe("3.0");
      expect(profile.functioningLevel).toBe("SUPPORTED");
      expect(profile.masteryOverview).toBeDefined();
      expect(profile.masteryOverview.math).toBeCloseTo(0.6875, 2);
      expect(profile.masteryOverview.reading).toBeCloseTo(0.6, 1);
    });
  });

  describe("getFunctioningLevel", () => {
    it("returns current level and ordered history", async () => {
      const mockApp = createMockApp();
      const service = new BrainProfileService(mockApp as never);
      const data = await service.getFunctioningLevel(LEARNER_ID);

      expect(data.current).toBe("SUPPORTED");
      expect(data.history).toHaveLength(3);
      expect(data.history[0].level).toBe("NON_VERBAL");
      expect(data.history[2].level).toBe("SUPPORTED");
    });
  });

  describe("getAccommodations", () => {
    it("returns accommodation list", async () => {
      const mockApp = createMockApp();
      const service = new BrainProfileService(mockApp as never);
      const data = await service.getAccommodations(LEARNER_ID);

      expect(data.accommodations).toHaveLength(3);
      expect(data.accommodations).toContain("extended_time");
    });
  });

  describe("getVersions", () => {
    it("returns snapshot versions", async () => {
      const mockApp = createMockApp();
      const service = new BrainProfileService(mockApp as never);
      const data = await service.getVersions(LEARNER_ID);

      expect(data.versions).toHaveLength(2);
      expect(data.versions[0].trigger).toBe("INITIAL_CLONE");
    });
  });
});
