import { describe, it, expect, vi, beforeEach } from "vitest";
import { LearnerService } from "../services/learner.service.js";

vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    nats: {},
  } as any;
}

describe("LearnerService", () => {
  let app: ReturnType<typeof createMockApp>;
  let learnerService: LearnerService;

  beforeEach(() => {
    app = createMockApp();
    learnerService = new LearnerService(app);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a learner and publish event", async () => {
      const newLearner = {
        id: "learner-1",
        name: "Test Child",
        tenantId: "tenant-1",
        parentId: "user-1",
        functioningLevel: "STANDARD",
        communicationMode: "VERBAL",
        status: "ACTIVE",
      };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newLearner]),
        }),
      });

      const { publishEvent } = await import("@aivo/events");
      const result = await learnerService.create("user-1", "tenant-1", {
        name: "Test Child",
      });

      expect(result).toEqual(newLearner);
      expect(publishEvent).toHaveBeenCalledWith(
        expect.anything(),
        "identity.learner.created",
        {
          learnerId: "learner-1",
          tenantId: "tenant-1",
          parentId: "user-1",
        },
      );
    });
  });

  describe("listByParent", () => {
    it("should return learners for a parent in tenant", async () => {
      const learnerData = [
        { id: "learner-1", name: "Child 1", parentId: "user-1", tenantId: "tenant-1" },
        { id: "learner-2", name: "Child 2", parentId: "user-1", tenantId: "tenant-1" },
      ];

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(learnerData),
        }),
      });

      const result = await learnerService.listByParent("user-1", "tenant-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getById", () => {
    it("should return learner when found", async () => {
      const learner = { id: "learner-1", name: "Child 1", tenantId: "tenant-1" };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([learner]),
          }),
        }),
      });

      const result = await learnerService.getById("learner-1", "tenant-1");
      expect(result).toEqual(learner);
    });

    it("should throw 404 if learner not found", async () => {
      await expect(
        learnerService.getById("nonexistent", "tenant-1"),
      ).rejects.toThrow("Learner not found");
    });
  });
});
