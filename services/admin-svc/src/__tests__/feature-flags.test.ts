import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeatureFlagService } from "../services/feature-flag.service.js";

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
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    redis: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
  } as any;
}

describe("FeatureFlagService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: FeatureFlagService;

  beforeEach(() => {
    app = createMockApp();
    service = new FeatureFlagService(app);
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return flags with their overrides", async () => {
      const flags = [
        { id: "f1", key: "homework_helper_enabled", type: "BOOLEAN", enabled: true },
        { id: "f2", key: "quest_system_v2", type: "BOOLEAN", enabled: false },
      ];
      const overrides = [
        { id: "o1", flagId: "f1", tenantId: "t1", value: false },
      ];

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue(flags),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue(overrides),
        });

      const result = await service.list();
      expect(result).toHaveLength(2);
      expect(result[0].overrides).toHaveLength(1);
      expect(result[1].overrides).toHaveLength(0);
    });
  });

  describe("create", () => {
    it("should create a BOOLEAN flag and sync to Redis", async () => {
      const flag = { id: "f1", key: "new_feature", type: "BOOLEAN", defaultValue: true, enabled: true };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([flag]),
        }),
      });

      const result = await service.create(
        { key: "new_feature", type: "BOOLEAN", defaultValue: true, enabled: true },
        "admin-1",
      );

      expect(result.key).toBe("new_feature");
      expect(app.redis.set).toHaveBeenCalledWith(
        "ff:new_feature",
        JSON.stringify({ key: "new_feature", type: "BOOLEAN", defaultValue: true, enabled: true }),
      );
    });

    it("should create a PERCENTAGE flag", async () => {
      const flag = { id: "f2", key: "rollout_feature", type: "PERCENTAGE", defaultValue: 25, enabled: true };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([flag]),
        }),
      });

      const result = await service.create(
        { key: "rollout_feature", type: "PERCENTAGE", defaultValue: 25, enabled: true },
        "admin-1",
      );

      expect(result.type).toBe("PERCENTAGE");
    });
  });

  describe("update", () => {
    it("should update flag and sync to Redis", async () => {
      const flag = { id: "f1", key: "feature_x", enabled: false, defaultValue: true };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([flag]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });

      const result = await service.update("f1", { enabled: false }, "admin-1");
      expect(result.enabled).toBe(false);
      expect(app.redis.del).toHaveBeenCalledWith("ff:feature_x");
    });

    it("should throw 404 for missing flag", async () => {
      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        service.update("nonexistent", { enabled: true }, "admin-1"),
      ).rejects.toThrow("Feature flag not found");
    });
  });

  describe("setTenantOverride", () => {
    it("should create a new tenant override", async () => {
      const flag = { id: "f1", key: "feature_x" };
      const override = { id: "o1", flagId: "f1", tenantId: "t1", value: true };

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([flag]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([override]),
        }),
      });

      const result = await service.setTenantOverride(
        "f1",
        { tenantId: "t1", value: true },
        "admin-1",
      );

      expect(result.tenantId).toBe("t1");
      expect(app.redis.set).toHaveBeenCalledWith("ff:feature_x:t1", JSON.stringify(true));
    });

    it("should update existing tenant override", async () => {
      const flag = { id: "f1", key: "feature_x" };
      const existing = [{ id: "o1", flagId: "f1", tenantId: "t1", value: false }];
      const updated = { id: "o1", flagId: "f1", tenantId: "t1", value: true };

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([flag]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(existing),
            }),
          }),
        });

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });

      const result = await service.setTenantOverride(
        "f1",
        { tenantId: "t1", value: true },
        "admin-1",
      );

      expect(result.value).toBe(true);
    });
  });

  describe("getFlagValue", () => {
    it("should return tenant override when available", async () => {
      app.redis.get.mockResolvedValue(JSON.stringify(true));

      const result = await service.getFlagValue("feature_x", "t1");
      expect(result).toBe(true);
      expect(app.redis.get).toHaveBeenCalledWith("ff:feature_x:t1");
    });

    it("should fall back to global value", async () => {
      app.redis.get
        .mockResolvedValueOnce(null) // no tenant override
        .mockResolvedValueOnce(JSON.stringify(false)); // global value

      const result = await service.getFlagValue("feature_x", "t1");
      expect(result).toBe(false);
    });

    it("should fall back to database when not in Redis", async () => {
      app.redis.get.mockResolvedValue(null);

      const flag = { id: "f1", key: "feature_x", enabled: true, defaultValue: true };
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([flag]),
          }),
        }),
      });

      const result = await service.getFlagValue("feature_x");
      expect(result).toBe(true);
    });

    it("should return false for disabled flags", async () => {
      app.redis.get.mockResolvedValue(null);

      const flag = { id: "f1", key: "feature_x", enabled: false, defaultValue: true };
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([flag]),
          }),
        }),
      });

      const result = await service.getFlagValue("feature_x");
      expect(result).toBe(false);
    });
  });
});
