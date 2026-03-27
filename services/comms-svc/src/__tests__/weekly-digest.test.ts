import { describe, it, expect, vi } from "vitest";
import { DigestService } from "../services/digest.service.js";

vi.mock("../config.js", () => ({
  getConfig: () => ({
    APP_URL: "https://app.aivolearning.com",
  }),
}));

describe("DigestService", () => {
  it("should build digest data for active learner", () => {
    const mockApp = {} as any;
    const service = new DigestService(mockApp);

    const digestData = service.buildDigestData(
      {
        learnerId: "learner-1",
        learnerName: "Alex",
        parentId: "parent-1",
        parentEmail: "parent@test.com",
        parentName: "Jane",
      },
      { xpEarned: 450, lessonsCompleted: 12, streakDays: 7 },
    );

    expect(digestData.userName).toBe("Jane");
    expect(digestData.learnerName).toBe("Alex");
    expect(digestData.xpEarned).toBe(450);
    expect(digestData.lessonsCompleted).toBe(12);
    expect(digestData.streakDays).toBe(7);
    expect(digestData.weekSummary).toContain("Incredible week");
    expect(digestData.appUrl).toBe("https://app.aivolearning.com");
  });

  it("should generate motivational message for inactive learner", () => {
    const service = new DigestService({} as any);

    const digestData = service.buildDigestData(
      {
        learnerId: "learner-2",
        learnerName: "Sam",
        parentId: "parent-2",
        parentEmail: "parent2@test.com",
        parentName: "Bob",
      },
      { xpEarned: 0, lessonsCompleted: 0, streakDays: 0 },
    );

    expect(digestData.weekSummary).toContain("didn't have any learning sessions");
  });

  it("should generate standard message for moderate activity", () => {
    const service = new DigestService({} as any);

    const digestData = service.buildDigestData(
      {
        learnerId: "learner-3",
        learnerName: "Pat",
        parentId: "parent-3",
        parentEmail: "parent3@test.com",
        parentName: "Ann",
      },
      { xpEarned: 150, lessonsCompleted: 5, streakDays: 3 },
    );

    expect(digestData.weekSummary).toContain("productive week");
  });
});
