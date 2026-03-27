import { describe, it, expect } from "vitest";
import { renderTemplate, getAvailableTemplates, type TemplateSlug } from "../email/renderer.js";

describe("Email Templates", () => {
  it("should have all 21 templates registered", () => {
    const templates = getAvailableTemplates();
    expect(templates).toHaveLength(21);
  });

  const templateData: Record<TemplateSlug, Record<string, unknown>> = {
    welcome: { userName: "Jane Doe", appUrl: "https://app.aivolearning.com" },
    email_verification: { userName: "Jane", verificationUrl: "https://app.aivolearning.com/verify?t=abc", expiresIn: "24 hours" },
    password_reset: { userName: "Jane", resetUrl: "https://app.aivolearning.com/reset?t=abc", expiresIn: "1 hour" },
    invitation: { inviterName: "Jane", learnerName: "Alex", role: "TEACHER", acceptUrl: "https://app.aivolearning.com/accept?t=abc" },
    caregiver_invite: { parentName: "Jane", learnerName: "Alex", acceptUrl: "https://app.aivolearning.com/accept?t=abc" },
    subscription_confirmation: { userName: "Jane", planName: "FAMILY", price: "$19.99/mo", nextBillingDate: "March 1, 2026", appUrl: "https://app.aivolearning.com" },
    invoice_receipt: { userName: "Jane", amount: "$19.99", invoiceId: "INV-001", date: "Feb 1, 2026", downloadUrl: "https://app.aivolearning.com/invoices/INV-001" },
    dunning_retry: { userName: "Jane", retryDate: "Feb 4, 2026", updatePaymentUrl: "https://app.aivolearning.com/billing/manage" },
    dunning_suspend: { userName: "Jane", reactivateUrl: "https://app.aivolearning.com/billing/manage" },
    lead_confirmation: { contactName: "John", companyName: "Acme Schools", demoDate: "March 10, 2026", appUrl: "https://app.aivolearning.com" },
    nurture_sequence: { userName: "Jane", sequenceStep: 1, content: "<p>Here's a tip!</p>", ctaText: "Learn more", ctaUrl: "https://app.aivolearning.com" },
    tutor_activated: { userName: "Jane", tutorName: "AIVO Math Tutor", subject: "Math", learnerName: "Alex", appUrl: "https://app.aivolearning.com" },
    tutor_deactivated: { userName: "Jane", tutorName: "AIVO Math Tutor", subject: "Math", learnerName: "Alex", gracePeriodEnd: "March 8, 2026", appUrl: "https://app.aivolearning.com" },
    homework_ready: { userName: "Jane", learnerName: "Alex", subject: "Math", problemCount: 10, startUrl: "https://app.aivolearning.com/homework/123" },
    iep_goal_met: { userName: "Jane", goalText: "Count to 20 independently", learnerName: "Alex", celebrationMsg: "Amazing achievement!", appUrl: "https://app.aivolearning.com" },
    iep_refresh_reminder: { userName: "Jane", learnerName: "Alex", iepAge: "11 months", uploadUrl: "https://app.aivolearning.com/parent/abc/iep" },
    functioning_level_change: { userName: "Jane", previousLevel: "SUPPORTED", newLevel: "STANDARD", learnerName: "Alex", appUrl: "https://app.aivolearning.com" },
    brain_profile_reveal: { userName: "Jane", learnerName: "Alex", profileSummary: "Visual learner with strong spatial reasoning", reviewUrl: "https://app.aivolearning.com/parent/abc/brain" },
    streak_broken: { userName: "Jane", previousStreak: 15, learnerName: "Alex", resumeUrl: "https://app.aivolearning.com/learner" },
    badge_earned: { userName: "Jane", badgeName: "Math Whiz", badgeIcon: "https://cdn.aivolearning.com/badges/math-whiz.png", learnerName: "Alex", appUrl: "https://app.aivolearning.com" },
    weekly_progress_digest: {
      userName: "Jane", learnerName: "Alex", weekSummary: "Great week!", xpEarned: 450, lessonsCompleted: 12, streakDays: 7,
      masteryChanges: [{ subject: "Math", direction: "improved", delta: "+5%" }],
      recommendations: ["Try reading sessions"],
      appUrl: "https://app.aivolearning.com",
    },
  };

  for (const [slug, data] of Object.entries(templateData)) {
    describe(`template: ${slug}`, () => {
      it("should render valid HTML", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.subject).toBeTruthy();
        expect(result.html).toBeTruthy();
        expect(result.html).toContain("<!DOCTYPE html>");
        expect(result.html).toContain("</html>");
      });

      it("should include AIVO branding", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("AIVO");
        expect(result.html).toContain("Inter");
      });

      it("should include purple gradient header", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("linear-gradient(135deg, #915ee3");
      });

      it("should include #7C3AED CTA color", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("#7C3AED");
      });

      it("should include footer", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("All rights reserved");
      });

      it("should include dark mode support", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("prefers-color-scheme: dark");
      });

      it("should use 600px max-width", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("max-width: 600px");
      });

      it("should use 12px border-radius", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("border-radius: 12px");
      });

      it("should have UTM parameters on CTA links", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain("utm_source=aivo");
        expect(result.html).toContain("utm_medium=email");
        expect(result.html).toContain("utm_campaign=");
      });

      it("should not contain 'Click here'", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html.toLowerCase()).not.toContain("click here");
      });

      it("should have accessible layout tables", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain('role="presentation"');
      });

      it("should have lang attribute", () => {
        const result = renderTemplate(slug as TemplateSlug, data as any);
        expect(result.html).toContain('lang="en"');
      });
    });
  }

  it("should throw for unknown template", () => {
    expect(() => renderTemplate("nonexistent" as any, {})).toThrow("Unknown email template");
  });
});
