import { describe, it, expect, vi } from "vitest";
import { IepService } from "../services/iep.service.js";

const LEARNER_ID = "b0000000-0000-4000-a000-000000000001";

function createMockApp(goals: unknown[] = []) {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "doc-1", learnerId: LEARNER_ID }]),
        }),
      }),
    },
    s3: {
      uploadDocument: vi.fn().mockResolvedValue("https://s3.example.com/iep/test.pdf"),
    },
    log: { info: vi.fn(), error: vi.fn() },
  };
}

describe("IepService", () => {
  describe("getGoals", () => {
    it("calculates progress percent correctly", async () => {
      const mockGoals = [
        {
          id: "g1", learnerId: LEARNER_ID, goalText: "Use 2-word combinations",
          domain: "COMMUNICATION", targetMetric: "frequency_per_session",
          targetValue: "5", currentValue: "3.2", status: "ACTIVE",
          metAt: null, createdAt: new Date(), updatedAt: new Date(),
        },
      ];

      const mockApp = createMockApp(mockGoals);
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockGoals),
          }),
        }),
      });

      const service = new IepService(mockApp as never);
      const goals = await service.getGoals(LEARNER_ID);

      expect(goals).toHaveLength(1);
      expect(goals[0].progressPercent).toBe(64); // 3.2 / 5 = 64%
      expect(goals[0].trend).toBe("improving");
    });

    it("marks met goals with 100% progress", async () => {
      const mockGoals = [{
        id: "g1", learnerId: LEARNER_ID, goalText: "Count to 20",
        domain: "PRE_ACADEMIC", targetMetric: "count",
        targetValue: "20", currentValue: "20", status: "MET",
        metAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
      }];

      const mockApp = createMockApp();
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockGoals),
          }),
        }),
      });

      const service = new IepService(mockApp as never);
      const goals = await service.getGoals(LEARNER_ID);

      expect(goals[0].progressPercent).toBe(100);
      expect(goals[0].trend).toBe("achieved");
    });

    it("calculates at_risk trend for low progress", async () => {
      const mockGoals = [{
        id: "g1", learnerId: LEARNER_ID, goalText: "Read grade-level text",
        domain: "PRE_ACADEMIC", targetMetric: "accuracy",
        targetValue: "100", currentValue: "20", status: "ACTIVE",
        metAt: null, createdAt: new Date(), updatedAt: new Date(),
      }];

      const mockApp = createMockApp();
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockGoals),
          }),
        }),
      });

      const service = new IepService(mockApp as never);
      const goals = await service.getGoals(LEARNER_ID);

      expect(goals[0].progressPercent).toBe(20);
      expect(goals[0].trend).toBe("at_risk");
    });
  });

  describe("checkRefreshNeeded", () => {
    it("returns true when IEP is >10 months old", async () => {
      const elevenMonthsAgo = new Date();
      elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

      const mockApp = createMockApp();
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ createdAt: elevenMonthsAgo }]),
            }),
          }),
        }),
      });

      const service = new IepService(mockApp as never);
      const result = await service.checkRefreshNeeded(LEARNER_ID);
      expect(result).toBe(true);
    });

    it("returns false when IEP is recent", async () => {
      const mockApp = createMockApp();
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ createdAt: new Date() }]),
            }),
          }),
        }),
      });

      const service = new IepService(mockApp as never);
      const result = await service.checkRefreshNeeded(LEARNER_ID);
      expect(result).toBe(false);
    });

    it("returns false when no documents exist", async () => {
      const mockApp = createMockApp();
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const service = new IepService(mockApp as never);
      const result = await service.checkRefreshNeeded(LEARNER_ID);
      expect(result).toBe(false);
    });
  });

  describe("uploadDocument", () => {
    it("uploads to S3 and creates DB record", async () => {
      const mockApp = createMockApp();
      const service = new IepService(mockApp as never);
      const buffer = Buffer.from("fake-pdf-content");
      const doc = await service.uploadDocument(LEARNER_ID, "user-1", buffer, "application/pdf", "iep.pdf");

      expect(doc).toBeDefined();
      expect(mockApp.s3.uploadDocument).toHaveBeenCalled();
      expect(mockApp.db.insert).toHaveBeenCalled();
    });
  });
});
