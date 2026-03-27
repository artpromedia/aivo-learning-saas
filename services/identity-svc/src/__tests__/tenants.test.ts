import { describe, it, expect, vi, beforeEach } from "vitest";
import { TenantService } from "../services/tenant.service.js";

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
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
  } as any;
}

describe("TenantService", () => {
  let app: ReturnType<typeof createMockApp>;
  let tenantService: TenantService;

  beforeEach(() => {
    app = createMockApp();
    tenantService = new TenantService(app);
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return tenant if owned by requesting tenant", async () => {
      const tenant = {
        id: "tenant-1",
        name: "Test Family",
        slug: "family-abc",
        type: "B2C_FAMILY",
        status: "ACTIVE",
      };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([tenant]),
          }),
        }),
      });

      const result = await tenantService.getById("tenant-1", "tenant-1");
      expect(result).toEqual(tenant);
    });

    it("should throw 403 for cross-tenant access", async () => {
      await expect(
        tenantService.getById("tenant-1", "tenant-2"),
      ).rejects.toThrow("Access denied");
    });

    it("should throw 404 if tenant not found", async () => {
      await expect(
        tenantService.getById("nonexistent", "nonexistent"),
      ).rejects.toThrow("Tenant not found");
    });
  });

  describe("update", () => {
    it("should update tenant name", async () => {
      const updated = {
        id: "tenant-1",
        name: "Updated Family",
        slug: "family-abc",
        type: "B2C_FAMILY",
      };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      });

      const result = await tenantService.update("tenant-1", "tenant-1", { name: "Updated Family" });
      expect(result.name).toBe("Updated Family");
    });

    it("should throw 403 for cross-tenant update", async () => {
      await expect(
        tenantService.update("tenant-1", "tenant-2", { name: "Hack" }),
      ).rejects.toThrow("Access denied");
    });
  });
});
