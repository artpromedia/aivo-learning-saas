import { describe, it, expect, vi } from "vitest";
import { InsightService } from "../services/insight.service.js";

const LEARNER_ID = "b0000000-0000-4000-a000-000000000001";
const USER_ID = "c0000000-0000-4000-a000-000000000001";
const BRAIN_STATE_ID = "d0000000-0000-4000-a000-000000000001";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: BRAIN_STATE_ID, learnerId: LEARNER_ID }]),
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    },
    brainClient: {
      addInsight: vi.fn().mockResolvedValue(undefined),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  };
}

describe("InsightService", () => {
  describe("submitInsight", () => {
    it("pushes insight to brain-svc and stores as episode", async () => {
      const mockApp = createMockApp();
      const service = new InsightService(mockApp as never);
      const insight = await service.submitInsight(
        LEARNER_ID, USER_ID, "Alex has been reading chapter books at home", "parent",
      );

      expect(insight.text).toBe("Alex has been reading chapter books at home");
      expect(insight.attribution).toBe("parent");
      expect(insight.userId).toBe(USER_ID);
      expect(mockApp.brainClient.addInsight).toHaveBeenCalledWith(LEARNER_ID, {
        text: "Alex has been reading chapter books at home",
        attribution: "parent",
        userId: USER_ID,
      });
    });

    it("stores teacher insights with teacher attribution", async () => {
      const mockApp = createMockApp();
      const service = new InsightService(mockApp as never);
      const insight = await service.submitInsight(
        LEARNER_ID, USER_ID, "Student participates well in group work", "teacher",
      );

      expect(insight.attribution).toBe("teacher");
      expect(mockApp.brainClient.addInsight).toHaveBeenCalledWith(LEARNER_ID, expect.objectContaining({
        attribution: "teacher",
      }));
    });

    it("stores caregiver insights with caregiver attribution", async () => {
      const mockApp = createMockApp();
      const service = new InsightService(mockApp as never);
      const insight = await service.submitInsight(
        LEARNER_ID, USER_ID, "She practiced counting at the park", "caregiver",
      );

      expect(insight.attribution).toBe("caregiver");
    });
  });

  describe("getInsights", () => {
    it("returns empty array when no brain state", async () => {
      const mockApp = createMockApp();
      mockApp.db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const service = new InsightService(mockApp as never);
      const insights = await service.getInsights(LEARNER_ID);
      expect(insights).toEqual([]);
    });
  });
});
