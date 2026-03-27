import { describe, it, expect, vi } from "vitest";
import { RecommendationService } from "../services/recommendation.service.js";

const REC_ID = "a0000000-0000-4000-a000-000000000001";
const LEARNER_ID = "b0000000-0000-4000-a000-000000000001";
const USER_ID = "c0000000-0000-4000-a000-000000000001";
const BRAIN_STATE_ID = "d0000000-0000-4000-a000-000000000001";

function createMockApp(pendingRecs: unknown[] = [], allRecs: unknown[] = []) {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue(allRecs.slice(0, 10)),
            }),
            limit: vi.fn().mockResolvedValue(pendingRecs),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: REC_ID,
            learnerId: LEARNER_ID,
            brainStateId: BRAIN_STATE_ID,
            type: "CURRICULUM_ADJUSTMENT",
            title: "Test",
            description: "Test desc",
            payload: {},
            status: "PENDING",
            createdAt: new Date(),
          }]),
        }),
      }),
    },
    brainClient: {
      applyRecommendation: vi.fn().mockResolvedValue({ snapshotId: "snap-1" }),
      declineRecommendation: vi.fn().mockResolvedValue(undefined),
      addInsight: vi.fn().mockResolvedValue(undefined),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  };
}

describe("RecommendationService", () => {
  describe("respond - APPROVE", () => {
    it("calls brain-svc to apply change and updates status", async () => {
      const pendingRec = {
        id: REC_ID,
        learnerId: LEARNER_ID,
        type: "CURRICULUM_ADJUSTMENT",
        title: "Move to Grade 4 reading",
        description: "Test",
        payload: { subject: "reading" },
        status: "PENDING",
        createdAt: new Date(),
        respondedAt: null,
        parentResponseText: null,
        reTriggerGapDays: 14,
        updatedAt: new Date(),
      };

      const mockApp = createMockApp([pendingRec]);
      const service = new RecommendationService(mockApp as never);
      const result = await service.respond(REC_ID, USER_ID, "APPROVE");

      expect(result.success).toBe(true);
      expect(result.message).toContain("approved");
      expect(mockApp.brainClient.applyRecommendation).toHaveBeenCalledWith(
        LEARNER_ID, REC_ID, { subject: "reading" },
      );
    });
  });

  describe("respond - DECLINE", () => {
    it("marks as declined with 14-day re-trigger gap", async () => {
      const pendingRec = {
        id: REC_ID,
        learnerId: LEARNER_ID,
        type: "CURRICULUM_ADJUSTMENT",
        title: "Move to Grade 4",
        description: "Test",
        payload: {},
        status: "PENDING",
        createdAt: new Date(),
        respondedAt: null,
        parentResponseText: null,
        reTriggerGapDays: 14,
        updatedAt: new Date(),
      };

      const mockApp = createMockApp([pendingRec]);
      const service = new RecommendationService(mockApp as never);
      const result = await service.respond(REC_ID, USER_ID, "DECLINE");

      expect(result.success).toBe(true);
      expect(result.message).toContain("14 days");
      expect(mockApp.brainClient.declineRecommendation).toHaveBeenCalled();
    });
  });

  describe("respond - ADJUST", () => {
    it("saves parent text as Brain insight", async () => {
      const pendingRec = {
        id: REC_ID,
        learnerId: LEARNER_ID,
        type: "CURRICULUM_ADJUSTMENT",
        title: "Move to Grade 4",
        description: "Test",
        payload: {},
        status: "PENDING",
        createdAt: new Date(),
        respondedAt: null,
        parentResponseText: null,
        reTriggerGapDays: 14,
        updatedAt: new Date(),
      };

      const mockApp = createMockApp([pendingRec]);
      const service = new RecommendationService(mockApp as never);
      const adjustText = "He actually struggles with chapter books";
      const result = await service.respond(REC_ID, USER_ID, "ADJUST", adjustText);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Insight saved");
      expect(mockApp.brainClient.addInsight).toHaveBeenCalledWith(LEARNER_ID, {
        text: adjustText,
        attribution: "parent",
        userId: USER_ID,
      });
    });

    it("rejects ADJUST without text", async () => {
      const pendingRec = {
        id: REC_ID, learnerId: LEARNER_ID, type: "CURRICULUM_ADJUSTMENT",
        title: "Test", description: "Test", payload: {}, status: "PENDING",
        createdAt: new Date(), respondedAt: null, parentResponseText: null,
        reTriggerGapDays: 14, updatedAt: new Date(),
      };

      const mockApp = createMockApp([pendingRec]);
      const service = new RecommendationService(mockApp as never);

      await expect(service.respond(REC_ID, USER_ID, "ADJUST")).rejects.toThrow("requires text");
    });
  });

  describe("respond - already resolved", () => {
    it("rejects response on non-pending recommendation", async () => {
      const resolvedRec = {
        id: REC_ID, learnerId: LEARNER_ID, type: "CURRICULUM_ADJUSTMENT",
        title: "Test", description: "Test", payload: {}, status: "APPROVED",
        createdAt: new Date(), respondedAt: new Date(), parentResponseText: null,
        reTriggerGapDays: 14, updatedAt: new Date(),
      };

      const mockApp = createMockApp([resolvedRec]);
      const service = new RecommendationService(mockApp as never);

      await expect(service.respond(REC_ID, USER_ID, "APPROVE")).rejects.toThrow("already resolved");
    });
  });

  describe("getDefaultTitle", () => {
    it("returns title for all 13 recommendation types", () => {
      const mockApp = createMockApp();
      const service = new RecommendationService(mockApp as never);

      const types = [
        "CURRICULUM_ADJUSTMENT", "ACCOMMODATION_CHANGE", "FUNCTIONING_LEVEL_CHANGE",
        "TUTOR_ADDON", "IEP_GOAL_UPDATE", "ENGAGEMENT_BOOST",
        "PARENT_MEDIATED_ACTIVITY", "ASSESSMENT_REBASELINE", "DIFFICULTY_ADJUSTMENT",
        "MODALITY_SWITCH", "BREAK_SUGGESTION", "CELEBRATION", "REGRESSION_ALERT",
      ];

      for (const type of types) {
        const title = service.getDefaultTitle(type);
        expect(title).toBeTruthy();
        expect(title).not.toBe("Recommendation"); // Should have specific title
      }
    });
  });

  describe("createRecommendation", () => {
    it("creates recommendation with default title from type", async () => {
      const mockApp = createMockApp();
      const service = new RecommendationService(mockApp as never);

      const rec = await service.createRecommendation({
        learnerId: LEARNER_ID,
        brainStateId: BRAIN_STATE_ID,
        type: "REGRESSION_ALERT",
        description: "Regression detected in math",
        payload: { domain: "math", dropPercent: 15 },
      });

      expect(rec).toBeDefined();
      expect(mockApp.db.insert).toHaveBeenCalled();
    });
  });
});
