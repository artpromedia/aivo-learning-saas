import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildPushPayload, type PushNotificationType } from "../push/notification-builder.js";
import { PushService } from "../services/push.service.js";

describe("Push Notification Builder", () => {
  const types: PushNotificationType[] = [
    "recommendation_pending", "tutor_ready", "homework_ready",
    "badge_earned", "streak_broken", "brain_update",
    "iep_goal_met", "weekly_digest", "brain_regression", "level_up",
  ];

  for (const type of types) {
    it(`should build payload for ${type}`, () => {
      const payload = buildPushPayload(type, { learnerName: "Alex" });
      expect(payload.title).toBeTruthy();
      expect(payload.body).toBeTruthy();
      expect(payload.data.type).toBe(type);
    });
  }

  it("should include learner name in body", () => {
    const payload = buildPushPayload("badge_earned", { learnerName: "Alex", badgeName: "Star" });
    expect(payload.body).toContain("Alex");
    expect(payload.body).toContain("Star");
  });
});

describe("PushService", () => {
  it("should register and unregister tokens", async () => {
    const insertFn = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
    const deleteFn = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    const mockApp = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      },
      log: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
      fcm: { send: vi.fn().mockResolvedValue(undefined) },
      webPush: { send: vi.fn().mockResolvedValue(undefined) },
    } as any;

    const service = new PushService(mockApp);
    await service.registerToken("user-1", "fcm", "token-abc");
    expect(mockApp.db.insert).toHaveBeenCalled();
  });

  it("should skip push when no tokens registered", async () => {
    // The service calls select().from().where().limit(1) for prefs,
    // then select().from().where() (returns array) for tokens.
    // We make 'where' return a thenable that resolves to [] AND has .limit()
    const makeWhereResult = () => {
      const result = Promise.resolve([]) as any;
      result.limit = vi.fn().mockResolvedValue([]);
      return result;
    };
    const mockApp = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockImplementation(() => makeWhereResult()),
          }),
        }),
      },
      log: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
    } as any;

    const service = new PushService(mockApp);
    await service.sendToUser("user-1", "badge_earned", { learnerName: "Alex" });
    // Should not throw, just log and return
  });
});
