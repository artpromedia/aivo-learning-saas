import { describe, it, expect, vi, beforeEach } from "vitest";
import { AvatarService } from "../services/avatar.service.js";

function createMockApp() {
  const redisStore = new Map<string, string>();
  const redisSetStore = new Map<string, Set<string>>();

  return {
    redis: {
      get: vi.fn().mockImplementation(async (key: string) => redisStore.get(key) ?? null),
      set: vi.fn().mockImplementation(async (key: string, value: string) => {
        redisStore.set(key, value);
      }),
      smembers: vi.fn().mockImplementation(async (key: string) => {
        return [...(redisSetStore.get(key) ?? [])];
      }),
    },
    _redisStore: redisStore,
    _redisSetStore: redisSetStore,
  };
}

describe("AvatarService", () => {
  describe("getAvatar", () => {
    it("returns default empty avatar for new learner", async () => {
      const mockApp = createMockApp();
      const service = new AvatarService(mockApp as never);
      const avatar = await service.getAvatar("learner-1");

      expect(avatar.learnerId).toBe("learner-1");
      expect(avatar.equipped.hat).toBeNull();
      expect(avatar.equipped.outfit).toBeNull();
      expect(avatar.equipped.pet).toBeNull();
      expect(avatar.equipped.background).toBeNull();
      expect(avatar.equipped.frame).toBeNull();
      expect(avatar.equipped.effect).toBeNull();
    });

    it("returns saved avatar state", async () => {
      const mockApp = createMockApp();
      const saved = {
        learnerId: "learner-1",
        equipped: { hat: "hat_001", outfit: null, pet: null, background: null, frame: null, effect: null },
        lastUpdated: "2026-01-01T00:00:00.000Z",
      };
      mockApp._redisStore.set("avatar:learner-1", JSON.stringify(saved));

      const service = new AvatarService(mockApp as never);
      const avatar = await service.getAvatar("learner-1");

      expect(avatar.equipped.hat).toBe("hat_001");
    });
  });

  describe("updateAvatar", () => {
    it("equips owned items", async () => {
      const mockApp = createMockApp();
      mockApp._redisSetStore.set("inventory:learner-1", new Set(["hat_001", "outfit_001"]));

      const service = new AvatarService(mockApp as never);
      const avatar = await service.updateAvatar("learner-1", {
        hat: "hat_001",
        outfit: "outfit_001",
      });

      expect(avatar.equipped.hat).toBe("hat_001");
      expect(avatar.equipped.outfit).toBe("outfit_001");
    });

    it("allows unequipping items (null)", async () => {
      const mockApp = createMockApp();
      mockApp._redisSetStore.set("inventory:learner-1", new Set(["hat_001"]));

      const service = new AvatarService(mockApp as never);
      await service.updateAvatar("learner-1", { hat: "hat_001" });
      const avatar = await service.updateAvatar("learner-1", { hat: null });

      expect(avatar.equipped.hat).toBeNull();
    });

    it("rejects equipping unowned items", async () => {
      const mockApp = createMockApp();
      mockApp._redisSetStore.set("inventory:learner-1", new Set());

      const service = new AvatarService(mockApp as never);

      await expect(
        service.updateAvatar("learner-1", { hat: "hat_999" }),
      ).rejects.toThrow("not owned");
    });

    it("updates lastUpdated timestamp", async () => {
      const mockApp = createMockApp();
      mockApp._redisSetStore.set("inventory:learner-1", new Set(["hat_001"]));

      const service = new AvatarService(mockApp as never);
      const before = new Date().toISOString();
      const avatar = await service.updateAvatar("learner-1", { hat: "hat_001" });

      expect(new Date(avatar.lastUpdated).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime(),
      );
    });
  });
});
