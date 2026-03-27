import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService, type TemplateName } from "../services/email.service.js";

function createMockApp() {
  return {
    email: {
      send: vi.fn().mockResolvedValue(undefined),
    },
  } as any;
}

describe("EmailService", () => {
  let app: ReturnType<typeof createMockApp>;
  let emailService: EmailService;

  beforeEach(() => {
    app = createMockApp();
    emailService = new EmailService(app);
    vi.clearAllMocks();
  });

  describe("sendTemplate", () => {
    it("should send welcome email", async () => {
      const result = await emailService.sendTemplate("welcome", "user@example.com", {
        recipientName: "John Doe",
      });

      expect(result.sent).toBe(true);
      expect(result.template).toBe("welcome");
      expect(result.to).toBe("user@example.com");
      expect(app.email.send).toHaveBeenCalledWith({
        to: "user@example.com",
        subject: "Welcome to AIVO Learning!",
        html: expect.stringContaining("John Doe"),
      });
    });

    it("should send email verification", async () => {
      const result = await emailService.sendTemplate("email_verification", "user@example.com", {
        recipientName: "Jane",
        verificationUrl: "https://app.aivo.com/verify?token=abc",
      });

      expect(result.sent).toBe(true);
      expect(app.email.send).toHaveBeenCalledWith({
        to: "user@example.com",
        subject: "Verify your AIVO Learning email",
        html: expect.stringContaining("Verify Email"),
      });
    });

    it("should send password reset email", async () => {
      const result = await emailService.sendTemplate("password_reset", "user@example.com", {
        recipientName: "Alex",
        resetUrl: "https://app.aivo.com/reset?token=xyz",
      });

      expect(result.sent).toBe(true);
      expect(app.email.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Reset your AIVO Learning password",
        }),
      );
    });

    it("should send invitation email", async () => {
      const result = await emailService.sendTemplate("invitation", "teacher@example.com", {
        recipientName: "Teacher Bob",
        inviterName: "Parent Alice",
        learnerName: "Child Sam",
        acceptUrl: "https://app.aivo.com/accept?token=123",
      });

      expect(result.sent).toBe(true);
      expect(app.email.send).toHaveBeenCalledWith({
        to: "teacher@example.com",
        subject: expect.stringContaining("Teacher"),
        html: expect.stringContaining("Teacher Bob"),
      });
    });

    it("should send caregiver invitation email", async () => {
      const result = await emailService.sendTemplate("caregiver_invite", "grandma@example.com", {
        recipientName: "Grandma Eve",
        inviterName: "Parent Alice",
        learnerName: "Child Sam",
        acceptUrl: "https://app.aivo.com/accept?token=456",
      });

      expect(result.sent).toBe(true);
      expect(app.email.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Caregiver"),
        }),
      );
    });

    it("should send subscription confirmation", async () => {
      const result = await emailService.sendTemplate("subscription_confirmation", "user@example.com", {
        recipientName: "John",
        planName: "Family Pro",
      });

      expect(result.sent).toBe(true);
      expect(app.email.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("subscription"),
        }),
      );
    });

    it("should throw for unknown template", async () => {
      await expect(
        emailService.sendTemplate("nonexistent" as TemplateName, "test@test.com", {
          recipientName: "Test",
        }),
      ).rejects.toThrow("Unknown template");
    });

    it("should propagate email client errors", async () => {
      app.email.send.mockRejectedValue(new Error("SMTP error"));

      await expect(
        emailService.sendTemplate("welcome", "user@example.com", {
          recipientName: "Test",
        }),
      ).rejects.toThrow("SMTP error");
    });
  });
});
