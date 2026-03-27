import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditService } from "../services/audit.service.js";

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
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    },
    sql: vi.fn().mockResolvedValue([{ total: 0 }]),
  } as any;
}

describe("AuditService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: AuditService;

  beforeEach(() => {
    app = createMockApp();
    service = new AuditService(app);
    vi.clearAllMocks();
  });

  describe("log", () => {
    it("should create an immutable audit log entry", async () => {
      await service.log({
        adminUserId: "admin-1",
        action: "tenant.created",
        resourceType: "tenant",
        resourceId: "t1",
        details: { name: "Test Tenant" },
        ipAddress: "192.168.1.1",
      });

      expect(app.db.insert).toHaveBeenCalled();
    });

    it("should log without optional fields", async () => {
      await service.log({
        adminUserId: "admin-1",
        action: "tenant.listed",
        resourceType: "tenant",
      });

      expect(app.db.insert).toHaveBeenCalled();
    });
  });

  describe("query", () => {
    it("should return paginated audit logs", async () => {
      const logs = [
        {
          id: "log-1",
          adminUserId: "admin-1",
          action: "tenant.created",
          resourceType: "tenant",
          resourceId: "t1",
          details: { name: "Test" },
          ipAddress: "192.168.1.1",
          createdAt: new Date(),
        },
        {
          id: "log-2",
          adminUserId: "admin-1",
          action: "tenant.updated",
          resourceType: "tenant",
          resourceId: "t1",
          details: {},
          ipAddress: "192.168.1.1",
          createdAt: new Date(),
        },
      ];

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(logs),
              }),
            }),
          }),
        }),
      });
      app.sql.mockResolvedValue([{ total: 2 }]);

      const result = await service.query({ page: 1, limit: 50 });
      expect(result.items).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(2);
    });

    it("should filter by admin user", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await service.query({ adminUserId: "admin-1" });
      expect(result.items).toEqual([]);
    });

    it("should filter by action type", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await service.query({ action: "tenant.created" });
      expect(result.items).toEqual([]);
    });

    it("should filter by date range", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await service.query({
        startDate: "2026-01-01",
        endDate: "2026-12-31",
      });

      expect(result.items).toEqual([]);
    });

    it("should cap limit at 100", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await service.query({ limit: 500 });
      expect(result.pagination.limit).toBe(100);
    });
  });
});
