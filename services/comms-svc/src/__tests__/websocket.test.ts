import { describe, it, expect, vi } from "vitest";
import { broadcastToUser, broadcastNotification } from "../realtime/broadcaster.js";
import { isUserOnline, getOnlineUserCount } from "../realtime/socket-manager.js";

describe("WebSocket Broadcaster", () => {
  it("should broadcast to user room", () => {
    const emit = vi.fn();
    const mockApp = {
      io: {
        to: vi.fn().mockReturnValue({ emit }),
      },
      log: { debug: vi.fn() },
    } as any;

    broadcastToUser(mockApp, "user-1", "notification:new", {
      type: "badge_earned",
      title: "New badge!",
      body: "You earned a badge",
    });

    expect(mockApp.io.to).toHaveBeenCalledWith("user:user-1");
    expect(emit).toHaveBeenCalledWith("notification:new", {
      type: "badge_earned",
      title: "New badge!",
      body: "You earned a badge",
    });
  });

  it("should broadcast notification with id and actionUrl", () => {
    const emit = vi.fn();
    const mockApp = {
      io: {
        to: vi.fn().mockReturnValue({ emit }),
      },
      log: { debug: vi.fn() },
    } as any;

    broadcastNotification(mockApp, "user-1", {
      id: "notif-123",
      type: "iep_goal_met",
      title: "IEP Goal Met!",
      body: "Alex met a goal",
      actionUrl: "/parent/abc/iep",
    });

    expect(emit).toHaveBeenCalledWith("notification:new", expect.objectContaining({
      type: "iep_goal_met",
      title: "IEP Goal Met!",
      body: "Alex met a goal",
      data: { id: "notif-123", actionUrl: "/parent/abc/iep" },
    }));
  });
});

describe("Socket Manager", () => {
  it("should check if user is online", () => {
    const mockIo = {
      sockets: {
        adapter: {
          rooms: new Map([
            ["user:user-1", new Set(["socket-1", "socket-2"])],
          ]),
        },
      },
    } as any;

    expect(isUserOnline(mockIo, "user-1")).toBe(true);
    expect(isUserOnline(mockIo, "user-2")).toBe(false);
  });

  it("should count online users", () => {
    const mockIo = {
      sockets: {
        adapter: {
          rooms: new Map([
            ["user:user-1", new Set(["s1"])],
            ["user:user-2", new Set(["s2"])],
            ["socket-1", new Set(["s1"])], // Socket self-room, not a user room
          ]),
        },
      },
    } as any;

    expect(getOnlineUserCount(mockIo)).toBe(2);
  });
});
