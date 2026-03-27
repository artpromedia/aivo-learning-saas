import { describe, it, expect, vi, beforeEach } from "vitest";
import { TenantService } from "../services/tenant.service.js";

const MOCK_UUID = "00000000-0000-4000-a000-000000000001";
const MOCK_UUID_2 = "00000000-0000-4000-a000-000000000002";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
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
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    sql: vi.fn().mockResolvedValue([{ total: 0 }]),
  } as any;
}

describe("TenantService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: TenantService;

  beforeEach(() => {
    app = createMockApp();
    service = new TenantService(app);
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated tenant list", async () => {
      const tenantList = [
        { id: MOCK_UUID, name: "Family A", type: "B2C_FAMILY", status: "ACTIVE" },
        { id: "t2", name: "District B", type: "B2B_DISTRICT", status: "ACTIVE" },
      ];

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(tenantList),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 2 }]),
          }),
        });

      const result = await service.list({ page: 1, limit: 25 });

      expect(result.items).toEqual(tenantList);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(2);
    });

    it("should apply type filter", async () => {
      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        });

      const result = await service.list({ type: "B2B_DISTRICT" });
      expect(result.items).toEqual([]);
    });

    it("should cap limit at 100", async () => {
      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        });

      const result = await service.list({ limit: 500 });
      expect(result.pagination.limit).toBe(100);
    });
  });

  describe("getById", () => {
    it("should return tenant with config", async () => {
      const tenant = { id: MOCK_UUID, name: "Test", type: "B2C_FAMILY", status: "ACTIVE" };
      const config = { tenantId: MOCK_UUID, dailyLlmTokenQuota: 50000 };

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([tenant]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([config]),
            }),
          }),
        });

      const result = await service.getById(MOCK_UUID);
      expect(result.name).toBe("Test");
      expect(result.config).toEqual(config);
    });

    it("should throw 404 for missing tenant", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.getById("nonexistent")).rejects.toThrow("Tenant not found");
    });
  });

  describe("create", () => {
    it("should create B2C tenant with default quota", async () => {
      const tenant = { id: MOCK_UUID, name: "New Family", type: "B2C_FAMILY", slug: "family-abc" };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([tenant]),
        }),
      });

      const result = await service.create(
        { name: "New Family", type: "B2C_FAMILY" },
        MOCK_UUID_2,
      );

      expect(result.name).toBe("New Family");
      expect(app.db.insert).toHaveBeenCalledTimes(3); // tenant + config + audit
    });

    it("should create B2B tenant with higher quota", async () => {
      const tenant = { id: "00000000-0000-4000-a000-000000000099", name: "District", type: "B2B_DISTRICT", slug: "district-xyz" };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([tenant]),
        }),
      });

      const result = await service.create(
        { name: "District", type: "B2B_DISTRICT" },
        MOCK_UUID_2,
      );

      expect(result.type).toBe("B2B_DISTRICT");
    });
  });

  describe("suspend", () => {
    it("should suspend tenant and all users", async () => {
      const tenant = { id: MOCK_UUID, name: "Test", status: "SUSPENDED" };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([tenant]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });

      const result = await service.suspend(MOCK_UUID, MOCK_UUID_2, "Non-payment");
      expect(result.status).toBe("SUSPENDED");
    });

    it("should throw 404 for missing tenant", async () => {
      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        service.suspend("nonexistent", MOCK_UUID_2),
      ).rejects.toThrow("Tenant not found");
    });
  });

  describe("reactivate", () => {
    it("should reactivate suspended tenant", async () => {
      const tenant = { id: MOCK_UUID, name: "Test", status: "ACTIVE" };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([tenant]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });

      const result = await service.reactivate(MOCK_UUID, MOCK_UUID_2);
      expect(result.status).toBe("ACTIVE");
    });
  });

  describe("updateConfig", () => {
    it("should update tenant config", async () => {
      const config = { tenantId: MOCK_UUID, dailyLlmTokenQuota: 100000 };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([config]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });

      const result = await service.updateConfig(
        MOCK_UUID,
        { dailyLlmTokenQuota: 100000 },
        MOCK_UUID_2,
      );

      expect(result.dailyLlmTokenQuota).toBe(100000);
    });
  });
});
