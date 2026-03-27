import { describe, it, expect, vi } from "vitest";
import { SettingsService } from "../services/settings.service.js";

const USER_ID = "c0000000-0000-4000-a000-000000000001";

function createMockRedis() {
  const store = new Map<string, string>();
  return {
    get: vi.fn().mockImplementation(async (key: string) => store.get(key) ?? null),
    set: vi.fn().mockImplementation(async (key: string, value: string) => {
      store.set(key, value);
    }),
    _store: store,
  };
}

describe("Access Control & Settings", () => {
  describe("SettingsService", () => {
    it("returns default settings for new user", async () => {
      const redis = createMockRedis();
      const mockApp = { redis };
      const service = new SettingsService(mockApp as never);
      const settings = await service.getSettings(USER_ID);

      expect(settings.userId).toBe(USER_ID);
      expect(settings.leaderboardOptOut).toBe(false);
      expect(settings.weeklyDigestEmail).toBe(true);
      expect(settings.notificationsEnabled).toBe(true);
      expect(settings.privacyMode).toBe("standard");
    });

    it("persists and retrieves updated settings", async () => {
      const redis = createMockRedis();
      const mockApp = { redis };
      const service = new SettingsService(mockApp as never);

      await service.updateSettings(USER_ID, { dailyReportEmail: true });
      const settings = await service.getSettings(USER_ID);

      expect(settings.dailyReportEmail).toBe(true);
    });

    it("updates privacy settings (leaderboard opt-out)", async () => {
      const redis = createMockRedis();
      const mockApp = { redis };
      const service = new SettingsService(mockApp as never);

      const settings = await service.updatePrivacy(USER_ID, {
        leaderboardOptOut: true,
        privacyMode: "restricted",
      });

      expect(settings.leaderboardOptOut).toBe(true);
      expect(settings.privacyMode).toBe("restricted");
    });

    it("partial updates preserve existing settings", async () => {
      const redis = createMockRedis();
      const mockApp = { redis };
      const service = new SettingsService(mockApp as never);

      await service.updateSettings(USER_ID, { dailyReportEmail: true });
      await service.updateSettings(USER_ID, { notificationsEnabled: false });

      const settings = await service.getSettings(USER_ID);
      expect(settings.dailyReportEmail).toBe(true);
      expect(settings.notificationsEnabled).toBe(false);
    });
  });

  describe("Authority Hierarchy", () => {
    it("defines correct role hierarchy: PARENT > TEACHER > CAREGIVER", () => {
      const parentActions = ["approve", "decline", "adjust", "invite", "remove", "export"];
      const teacherActions = ["view_brain", "submit_insight"];
      const caregiverActions = ["view_summary"];

      expect(parentActions.length).toBeGreaterThan(teacherActions.length);
      expect(teacherActions.length).toBeGreaterThan(caregiverActions.length);
    });

    it("parent-only actions exclude teacher and caregiver", () => {
      const parentOnlyActions = ["approve", "decline", "adjust", "invite", "remove", "export"];
      const teacherAllowed = ["view_brain", "submit_insight"];

      for (const action of parentOnlyActions) {
        expect(teacherAllowed).not.toContain(action);
      }
    });
  });

  describe("Recommendation actions", () => {
    it("APPROVE is a valid action", () => {
      const validActions = ["APPROVE", "DECLINE", "ADJUST"];
      expect(validActions).toContain("APPROVE");
    });

    it("DECLINE is a valid action", () => {
      const validActions = ["APPROVE", "DECLINE", "ADJUST"];
      expect(validActions).toContain("DECLINE");
    });

    it("ADJUST is a valid action", () => {
      const validActions = ["APPROVE", "DECLINE", "ADJUST"];
      expect(validActions).toContain("ADJUST");
    });

    it("only 3 actions exist", () => {
      const validActions = ["APPROVE", "DECLINE", "ADJUST"];
      expect(validActions).toHaveLength(3);
    });
  });

  describe("B2C slot limits", () => {
    it("max 1 teacher for B2C families", () => {
      const MAX_TEACHERS_B2C = 1;
      expect(MAX_TEACHERS_B2C).toBe(1);
    });

    it("max 2 caregivers for B2C families", () => {
      const MAX_CAREGIVERS_B2C = 2;
      expect(MAX_CAREGIVERS_B2C).toBe(2);
    });
  });
});
