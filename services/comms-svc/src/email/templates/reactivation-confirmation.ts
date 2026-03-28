import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface ReactivationConfirmationData {
  userName: string;
  planName: string;
  dashboardUrl: string;
}

export function reactivationConfirmationTemplate(data: ReactivationConfirmationData): { subject: string; html: string } {
  const dashCta = utmUrl(data.dashboardUrl, "reactivation_confirmation");

  return {
    subject: "Welcome back! Your AIVO subscription is active again",
    html: baseLayout({
      title: "Subscription Reactivated",
      preheader: "Your subscription has been reactivated and all Brain data is preserved.",
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #10B981; margin: 0 0 16px;">Your subscription is active again!</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Great news! Your AIVO <strong>${escapeHtml(data.planName)}</strong> subscription has been successfully reactivated.</p>
        <p style="margin: 0 0 16px;">All of your learner's Brain data has been fully preserved, including:</p>
        <ul style="margin: 0 0 16px; padding-left: 24px;">
          <li style="margin-bottom: 8px;">Brain profile and mastery levels</li>
          <li style="margin-bottom: 8px;">All session history and progress</li>
          <li style="margin-bottom: 8px;">IEP data and accommodations</li>
          <li style="margin-bottom: 8px;">Badges, XP, and quest progress</li>
        </ul>
        <p style="margin: 0 0 16px;">Pick up right where you left off:</p>
        ${ctaButton("Go to Dashboard", dashCta)}
      `,
    }),
  };
}
