import { describe, it, expect } from "vitest";
import { auditEmailHtml, auditAllTemplates } from "../email/brand-audit.js";
import { renderTemplate, getAvailableTemplates, type TemplateSlug } from "../email/renderer.js";

const sampleData: Record<string, Record<string, unknown>> = {
  welcome: { userName: "Test", appUrl: "https://app.test.com" },
  email_verification: { userName: "Test", verificationUrl: "https://app.test.com/verify", expiresIn: "24h" },
  password_reset: { userName: "Test", resetUrl: "https://app.test.com/reset", expiresIn: "1h" },
  invitation: { inviterName: "A", learnerName: "B", role: "TEACHER", acceptUrl: "https://app.test.com/accept" },
  caregiver_invite: { parentName: "A", learnerName: "B", acceptUrl: "https://app.test.com/accept" },
  subscription_confirmation: { userName: "Test", planName: "FAMILY", price: "$19.99", nextBillingDate: "Jan 1", appUrl: "https://app.test.com" },
  invoice_receipt: { userName: "Test", amount: "$19.99", invoiceId: "INV-1", date: "Jan 1", downloadUrl: "https://app.test.com/dl" },
  dunning_retry: { userName: "Test", retryDate: "Jan 4", updatePaymentUrl: "https://app.test.com/pay" },
  dunning_suspend: { userName: "Test", reactivateUrl: "https://app.test.com/reactivate" },
  lead_confirmation: { contactName: "Test", companyName: "Acme", demoDate: "Jan 10", appUrl: "https://app.test.com" },
  nurture_sequence: { userName: "Test", sequenceStep: 1, content: "<p>Tip</p>", ctaText: "Go", ctaUrl: "https://app.test.com" },
  tutor_activated: { userName: "Test", tutorName: "Math Tutor", subject: "Math", learnerName: "Alex", appUrl: "https://app.test.com" },
  tutor_deactivated: { userName: "Test", tutorName: "Math Tutor", subject: "Math", learnerName: "Alex", gracePeriodEnd: "Jan 8", appUrl: "https://app.test.com" },
  homework_ready: { userName: "Test", learnerName: "Alex", subject: "Math", problemCount: 5, startUrl: "https://app.test.com/hw" },
  iep_goal_met: { userName: "Test", goalText: "Count to 10", learnerName: "Alex", celebrationMsg: "Great!", appUrl: "https://app.test.com" },
  iep_refresh_reminder: { userName: "Test", learnerName: "Alex", iepAge: "11 months", uploadUrl: "https://app.test.com/iep" },
  functioning_level_change: { userName: "Test", previousLevel: "SUPPORTED", newLevel: "STANDARD", learnerName: "Alex", appUrl: "https://app.test.com" },
  brain_profile_reveal: { userName: "Test", learnerName: "Alex", profileSummary: "Visual learner", reviewUrl: "https://app.test.com/brain" },
  streak_broken: { userName: "Test", previousStreak: 7, learnerName: "Alex", resumeUrl: "https://app.test.com/learn" },
  badge_earned: { userName: "Test", badgeName: "Star", badgeIcon: "", learnerName: "Alex", appUrl: "https://app.test.com" },
  weekly_progress_digest: { userName: "Test", learnerName: "Alex", weekSummary: "Good week", xpEarned: 100, lessonsCompleted: 5, streakDays: 3, masteryChanges: [], recommendations: [], appUrl: "https://app.test.com" },
  regression_rollback_offer: { userName: "Test", learnerName: "Alex", domains: "Math", dropSummary: "Scores declined", rollbackUrl: "https://app.test.com/rollback", appUrl: "https://app.test.com" },
  teacher_insight: { userName: "Test", learnerName: "Alex", teacherName: "Mr. Smith", insightText: "Improving in fractions", reviewUrl: "https://app.test.com/insights" },
  grace_period_started: { userName: "Test", gracePeriodEndsAt: "May 1", exportUrl: "https://app.test.com/export", resubscribeUrl: "https://app.test.com/reactivate" },
  grace_period_warning: { userName: "Test", gracePeriodEndsAt: "May 7", daysRemaining: 7, exportUrl: "https://app.test.com/export", resubscribeUrl: "https://app.test.com/reactivate" },
  export_ready: { userName: "Test", learnerName: "Alex", downloadUrl: "https://app.test.com/dl/export.zip", expiresAt: "April 15" },
  data_deletion_confirmation: { userName: "Test", learnerId: "learner_123" },
  incident_created: { title: "Outage", impact: "Service down", message: "Investigating.", services: ["learning-svc"], statusPageUrl: "https://status.test.com/inc/1", unsubscribeUrl: "https://status.test.com/unsub" },
  incident_updated: { title: "Outage", status: "Investigating", message: "Fix deploying.", statusPageUrl: "https://status.test.com/inc/1", unsubscribeUrl: "https://status.test.com/unsub" },
  incident_resolved: { title: "Outage", resolvedAt: "March 30, 2026", statusPageUrl: "https://status.test.com/inc/1", unsubscribeUrl: "https://status.test.com/unsub" },
  maintenance_scheduled: { title: "DB Upgrade", description: "Upgrading DB.", scheduledStart: "April 5 2AM", scheduledEnd: "April 5 4AM", statusPageUrl: "https://status.test.com/maint/1", unsubscribeUrl: "https://status.test.com/unsub" },
  maintenance_started: { title: "DB Upgrade", statusPageUrl: "https://status.test.com/maint/1", unsubscribeUrl: "https://status.test.com/unsub" },
  maintenance_completed: { title: "DB Upgrade", statusPageUrl: "https://status.test.com/maint/1", unsubscribeUrl: "https://status.test.com/unsub" },
};

describe("Brand Audit", () => {
  it("should audit a single template HTML", () => {
    const { html } = renderTemplate("welcome", sampleData.welcome as any);
    const result = auditEmailHtml("welcome", html);
    expect(result.template).toBe("welcome");
    expect(result.checks.length).toBeGreaterThan(10);
  });

  describe("all templates pass brand audit", () => {
    const templates = getAvailableTemplates();

    for (const slug of templates) {
      it(`${slug} passes brand audit`, () => {
        const data = sampleData[slug];
        expect(data).toBeDefined();
        const { html } = renderTemplate(slug, data as any);
        const result = auditEmailHtml(slug, html);

        const failedChecks = result.checks.filter((c) => !c.passed);
        if (failedChecks.length > 0) {
          console.log(`Failed checks for ${slug}:`, failedChecks);
        }
        expect(result.passed).toBe(true);
      });
    }
  });

  it("should audit all templates at once", () => {
    const templates = getAvailableTemplates();
    const rendered = templates.map((slug) => {
      const { html } = renderTemplate(slug, sampleData[slug] as any);
      return { name: slug, html };
    });

    const { allPassed, results } = auditAllTemplates(rendered);
    expect(results).toHaveLength(33);
    expect(allPassed).toBe(true);
  });
});
