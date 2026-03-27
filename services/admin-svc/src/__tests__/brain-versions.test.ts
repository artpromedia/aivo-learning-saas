import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrainVersionService } from "../services/brain-version.service.js";

const MOCK_UUID = "00000000-0000-4000-a000-000000000001";
const MOCK_UUID_2 = "00000000-0000-4000-a000-000000000002";
const MOCK_UUID_3 = "00000000-0000-4000-a000-000000000003";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
            limit: vi.fn().mockResolvedValue([]),
          }),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    brainClient: {
      upgradeBrains: vi.fn().mockResolvedValue({ upgraded: 5, failed: 0 }),
      rollbackBrains: vi.fn().mockResolvedValue({ rolledBack: 5 }),
      getBrainHealth: vi.fn().mockResolvedValue({ masteryScores: { math: 0.8, reading: 0.9 } }),
    },
    sql: vi.fn().mockResolvedValue([]),
  } as any;
}

describe("BrainVersionService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: BrainVersionService;

  beforeEach(() => {
    app = createMockApp();
    service = new BrainVersionService(app);
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return all brain versions", async () => {
      const versions = [
        { id: MOCK_UUID, version: "3.0", status: "ACTIVE" },
        { id: MOCK_UUID_3, version: "3.1", status: "PUBLISHED" },
      ];

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(versions),
        }),
      });

      const result = await service.list();
      expect(result).toEqual(versions);
    });
  });

  describe("create", () => {
    it("should create a new brain version", async () => {
      const version = { id: MOCK_UUID, version: "3.1", status: "PUBLISHED", changelog: "New features" };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([version]),
        }),
      });

      const result = await service.create(
        { version: "3.1", changelog: "New features" },
        MOCK_UUID_2,
      );

      expect(result.version).toBe("3.1");
      expect(result.status).toBe("PUBLISHED");
    });
  });

  describe("startRollout", () => {
    it("should start Phase 1 rollout (5%)", async () => {
      const version = { id: MOCK_UUID, version: "3.1", status: "PUBLISHED" };
      const rollout = {
        id: "00000000-0000-4000-a000-00000000000a",
        brainVersionId: MOCK_UUID,
        phase: "PHASE_1",
        status: "MONITORING",
        targetPercentage: 5,
        brainsUpgraded: 5,
        brainsTotal: 100,
      };

      // getById
      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([version]),
            }),
          }),
        })
        // count brains
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{ total: 100 }]),
        })
        // select random brains
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "00000000-0000-4000-a000-000000000b01" },
                { id: "00000000-0000-4000-a000-000000000b02" },
                { id: "00000000-0000-4000-a000-000000000b03" },
                { id: "00000000-0000-4000-a000-000000000b04" },
                { id: "00000000-0000-4000-a000-000000000b05" },
              ]),
            }),
          }),
        });

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([rollout]),
        }),
      });
      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([version]),
          }),
        }),
      });

      const result = await service.startRollout(MOCK_UUID, MOCK_UUID_2);
      expect(result.phase).toBe("PHASE_1");
      expect(result.targetPercentage).toBe(5);
      expect(app.brainClient.upgradeBrains).toHaveBeenCalledWith(
        [
          "00000000-0000-4000-a000-000000000b01",
          "00000000-0000-4000-a000-000000000b02",
          "00000000-0000-4000-a000-000000000b03",
          "00000000-0000-4000-a000-000000000b04",
          "00000000-0000-4000-a000-000000000b05",
        ],
        "3.1",
      );
    });

    it("should reject rollout for non-PUBLISHED version", async () => {
      const version = { id: MOCK_UUID, version: "3.0", status: "ACTIVE" };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([version]),
          }),
        }),
      });

      await expect(
        service.startRollout(MOCK_UUID, MOCK_UUID_2),
      ).rejects.toThrow("Version must be PUBLISHED to start rollout");
    });
  });

  describe("rollback", () => {
    it("should rollback all upgraded brains", async () => {
      const version = { id: MOCK_UUID, version: "3.1", status: "ROLLING_OUT" };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([version]),
          }),
        }),
      });
      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([version]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });

      const result = await service.rollback(MOCK_UUID, MOCK_UUID_2, "Critical regression");
      expect(result.rolledBack).toBe(true);
      expect(app.brainClient.rollbackBrains).toHaveBeenCalledWith(MOCK_UUID);
    });
  });

  describe("getRolloutStatus", () => {
    it("should return rollout history with version info", async () => {
      const version = { id: MOCK_UUID, version: "3.1", status: "ROLLING_OUT" };
      const rollouts = [
        { id: "00000000-0000-4000-a000-00000000000b", phase: "PHASE_2", status: "MONITORING" },
        { id: "00000000-0000-4000-a000-00000000000a", phase: "PHASE_1", status: "COMPLETED" },
      ];

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(rollouts),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([version]),
            }),
          }),
        });

      const result = await service.getRolloutStatus(MOCK_UUID);
      expect(result.currentPhase).toBe("PHASE_2");
      expect(result.currentStatus).toBe("MONITORING");
      expect(result.rollouts).toHaveLength(2);
    });
  });
});
