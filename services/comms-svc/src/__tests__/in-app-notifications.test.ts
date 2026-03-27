import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "../services/notification.service.js";

function createMockApp() {
  const insertReturning = vi.fn().mockResolvedValue([{ id: "notif-1" }]);
  return {
    db: {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: insertReturning,
        }),
      }),
      select: vi.fn().mockImplementation(() => ({
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
      })),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    io: {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    },
    log: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
  } as any;
}

describe("NotificationService", () => {
  let mockApp: ReturnType<typeof createMockApp>;
  let service: NotificationService;

  beforeEach(() => {
    mockApp = createMockApp();
    service = new NotificationService(mockApp);
  });

  it("should create a notification and broadcast", async () => {
    const result = await service.create({
      userId: "user-1",
      type: "badge_earned",
      title: "Badge earned!",
      body: "Alex earned the Star badge",
      actionUrl: "/badges",
    });

    expect(result.id).toBe("notif-1");
    expect(mockApp.db.insert).toHaveBeenCalled();
    expect(mockApp.io.to).toHaveBeenCalledWith("user:user-1");
  });

  it("should mark notification as read", async () => {
    await service.markAsRead("notif-1", "user-1");
    expect(mockApp.db.update).toHaveBeenCalled();
  });

  it("should mark all notifications as read", async () => {
    await service.markAllAsRead("user-1");
    expect(mockApp.db.update).toHaveBeenCalled();
  });
});
