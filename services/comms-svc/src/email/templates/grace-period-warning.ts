import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface GracePeriodWarningData {
  userName: string;
  gracePeriodEndsAt: string;
  daysRemaining: number;
  exportUrl: string;
  resubscribeUrl: string;
}

export function gracePeriodWarningTemplate(data: GracePeriodWarningData): { subject: string; html: string } {
  const resubCta = utmUrl(data.resubscribeUrl, "grace_warning_7day");

  return {
    subject: `Action required: ${data.daysRemaining} days until your child's Brain data is deleted`,
    html: baseLayout({
      title: "Grace Period Ending Soon",
      preheader: `Your learner's data will be permanently deleted on ${data.gracePeriodEndsAt}.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #EF4444; margin: 0 0 16px;">Your data will be deleted in ${data.daysRemaining} days</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Your AIVO subscription grace period ends on <strong>${escapeHtml(data.gracePeriodEndsAt)}</strong>. After this date, <strong>all learner Brain data will be permanently and irreversibly deleted</strong>, including:</p>
        <ul style="margin: 0 0 16px; padding-left: 24px;">
          <li style="margin-bottom: 8px;">Brain profile and mastery levels</li>
          <li style="margin-bottom: 8px;">All session history and progress</li>
          <li style="margin-bottom: 8px;">IEP data and accommodations</li>
          <li style="margin-bottom: 8px;">Homework sessions and tutor interactions</li>
          <li style="margin-bottom: 8px;">Badges, XP, and quest progress</li>
        </ul>
        <p style="margin: 0 0 16px;"><strong>Resubscribe now to keep all data intact:</strong></p>
        ${ctaButton("Resubscribe & Keep Data", resubCta)}
      `,
    }),
  };
}
