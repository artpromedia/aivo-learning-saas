import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../services/user.service.js";

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

describe("UserService", () => {
  let app: ReturnType<typeof createMockApp>;
  let userService: UserService;

  beforeEach(() => {
    app = createMockApp();
    userService = new UserService(app);
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return user when found", async () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "PARENT",
        tenantId: "tenant-1",
      };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([user]),
          }),
        }),
      });

      const result = await userService.getById("user-1");
      expect(result).toEqual(user);
    });

    it("should throw 404 when user not found", async () => {
      await expect(userService.getById("nonexistent")).rejects.toThrow("User not found");
    });
  });

  describe("updateProfile", () => {
    it("should update and return user", async () => {
      const updatedUser = {
        id: "user-1",
        name: "Updated Name",
        email: "test@example.com",
        role: "PARENT",
      };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      });

      const result = await userService.updateProfile("user-1", { name: "Updated Name" });
      expect(result.name).toBe("Updated Name");
    });

    it("should throw 404 if user not found for update", async () => {
      await expect(
        userService.updateProfile("nonexistent", { name: "Test" }),
      ).rejects.toThrow("User not found");
    });
  });

  describe("deleteAccount", () => {
    it("should soft-delete by setting status to SUSPENDED", async () => {
      const user = { id: "user-1", status: "ACTIVE" };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([user]),
          }),
        }),
      });

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await userService.deleteAccount("user-1");
      expect(result.success).toBe(true);
      expect(app.db.update).toHaveBeenCalled();
    });

    it("should throw 404 if user not found for delete", async () => {
      await expect(userService.deleteAccount("nonexistent")).rejects.toThrow("User not found");
    });
  });
});
