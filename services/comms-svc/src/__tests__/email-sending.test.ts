import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "../services/email.service.js";

function createMockApp() {
  return {
    email: {
      send: vi.fn().mockResolvedValue(undefined),
    },
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    log: {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    },
  } as any;
}

describe("EmailService", () => {
  let mockApp: ReturnType<typeof createMockApp>;
  let service: EmailService;

  beforeEach(() => {
    mockApp = createMockApp();
    service = new EmailService(mockApp);
  });

  it("should send a template email", async () => {
    await service.sendTemplate("welcome", "test@example.com", null, {
      userName: "Test User",
      appUrl: "https://app.test.com",
    });

    expect(mockApp.email.send).toHaveBeenCalledOnce();
    const call = mockApp.email.send.mock.calls[0][0];
    expect(call.to).toBe("test@example.com");
    expect(call.subject).toContain("Welcome");
    expect(call.html).toContain("Test User");
    expect(call.tags).toContain("welcome");
  });

  it("should send raw email", async () => {
    await service.sendRaw("test@example.com", "Test Subject", "<p>Test</p>", ["tag1"]);

    expect(mockApp.email.send).toHaveBeenCalledWith({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test</p>",
      tags: ["tag1"],
    });
  });

  it("should skip email when user opted out", async () => {
    // Mock preference check to return opted-out
    mockApp.db.select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            emailEnabled: false,
            pushEnabled: true,
            inAppEnabled: true,
          }]),
        }),
      }),
    });

    await service.sendTemplate("welcome", "test@example.com", "user-123", {
      userName: "Test",
      appUrl: "https://app.test.com",
    });

    expect(mockApp.email.send).not.toHaveBeenCalled();
  });
});
