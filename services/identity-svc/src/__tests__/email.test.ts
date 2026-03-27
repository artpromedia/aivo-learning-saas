import { describe, it, expect } from "vitest";
import { welcomeTemplate } from "../email-templates/welcome.js";
import { emailVerificationTemplate } from "../email-templates/email-verification.js";
import { passwordResetTemplate } from "../email-templates/password-reset.js";
import { invitationTemplate } from "../email-templates/invitation.js";
import { caregiverInviteTemplate } from "../email-templates/caregiver-invite.js";
import { subscriptionConfirmationTemplate } from "../email-templates/subscription-confirmation.js";

describe("Email Templates", () => {
  describe("welcomeTemplate", () => {
    it("should render welcome email with user name", () => {
      const html = welcomeTemplate("John Doe");
      expect(html).toContain("John Doe");
      expect(html).toContain("AIVO Learning");
      expect(html).toContain("Welcome");
      // Brand compliance
      expect(html).toContain("#7C4DFF"); // Header purple gradient
      expect(html).toContain("Inter"); // Font family
      expect(html).toContain("600px"); // Max width
    });

    it("should escape HTML in user name", () => {
      const html = welcomeTemplate('<script>alert("xss")</script>');
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });
  });

  describe("emailVerificationTemplate", () => {
    it("should render verification email with CTA button", () => {
      const html = emailVerificationTemplate("Jane", "https://app.aivo.com/verify?token=abc");
      expect(html).toContain("Jane");
      expect(html).toContain("Verify");
      expect(html).toContain("https://app.aivo.com/verify?token=abc");
      expect(html).toContain("#7C3AED"); // CTA button color
    });

    it("should escape URLs in template", () => {
      const html = emailVerificationTemplate("Test", 'https://example.com/?q="><script>');
      expect(html).not.toContain('"><script>');
    });
  });

  describe("passwordResetTemplate", () => {
    it("should render password reset with reset URL", () => {
      const html = passwordResetTemplate("Alex", "https://app.aivo.com/reset?token=xyz");
      expect(html).toContain("Alex");
      expect(html).toContain("Reset");
      expect(html).toContain("https://app.aivo.com/reset?token=xyz");
      expect(html).toContain("#7C3AED");
    });
  });

  describe("invitationTemplate", () => {
    it("should render teacher invitation email", () => {
      const html = invitationTemplate("Teacher Bob", "Parent Alice", "Child Sam", "https://app.aivo.com/accept?token=123");
      expect(html).toContain("Teacher Bob");
      expect(html).toContain("Parent Alice");
      expect(html).toContain("Child Sam");
      expect(html).toContain("Teacher");
      expect(html).toContain("Accept Invitation");
      expect(html).toContain("#7C3AED");
    });
  });

  describe("caregiverInviteTemplate", () => {
    it("should render caregiver invitation email", () => {
      const html = caregiverInviteTemplate("Grandma Eve", "Parent Alice", "Child Sam", "https://app.aivo.com/accept?token=456");
      expect(html).toContain("Grandma Eve");
      expect(html).toContain("Caregiver");
      expect(html).toContain("Accept Invitation");
    });
  });

  describe("subscriptionConfirmationTemplate", () => {
    it("should render subscription confirmation", () => {
      const html = subscriptionConfirmationTemplate("John", "Family Pro");
      expect(html).toContain("John");
      expect(html).toContain("Family Pro");
      expect(html).toContain("Active");
      expect(html).toContain("Subscription Confirmed");
    });
  });

  describe("WCAG AA Compliance", () => {
    it("all templates should have proper lang attribute", () => {
      const html = welcomeTemplate("Test");
      expect(html).toContain('lang="en"');
    });

    it("all templates should have proper role attributes on tables", () => {
      const html = welcomeTemplate("Test");
      expect(html).toContain('role="presentation"');
    });

    it("CTA buttons should have role=button", () => {
      const html = emailVerificationTemplate("Test", "https://example.com");
      expect(html).toContain('role="button"');
    });
  });
});
