import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface GracePeriodStartedData {
  userName: string;
  gracePeriodEndsAt: string;
  exportUrl: string;
  resubscribeUrl: string;
}

export function gracePeriodStartedTemplate(data: GracePeriodStartedData): { subject: string; html: string } {
  const exportCta = utmUrl(data.exportUrl, "grace_period_started");
  const resubCta = utmUrl(data.resubscribeUrl, "grace_period_started");

  return {
    subject: "Your AIVO subscription has been cancelled",
    html: baseLayout({
      title: "Subscription Cancelled",
      preheader: `You have until ${data.gracePeriodEndsAt} to resubscribe and keep all data.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">We're sorry to see you go</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Your AIVO subscription has been cancelled. You have a <strong>30-day grace period</strong> until <strong>${escapeHtml(data.gracePeriodEndsAt)}</strong> during which:</p>
        <ul style="margin: 0 0 16px; padding-left: 24px;">
          <li style="margin-bottom: 8px;">All Brain data is <strong>fully preserved</strong></li>
          <li style="margin-bottom: 8px;">You can <strong>export all data</strong> at any time</li>
          <li style="margin-bottom: 8px;">You can <strong>resubscribe</strong> and pick up right where you left off</li>
        </ul>
        <p style="margin: 0 0 16px;">After the grace period, all learner data will be permanently deleted.</p>
        <div style="margin: 0 0 16px;">
          ${ctaButton("Export Brain Data", exportCta)}
        </div>
        <div style="margin: 0 0 16px;">
          ${ctaButton("Resubscribe Now", resubCta)}
        </div>
      `,
    }),
  };
}
