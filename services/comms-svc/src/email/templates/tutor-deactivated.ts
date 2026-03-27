import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface TutorDeactivatedData {
  userName: string;
  tutorName: string;
  subject: string;
  learnerName: string;
  gracePeriodEnd: string;
  appUrl: string;
}

export function tutorDeactivatedTemplate(data: TutorDeactivatedData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/settings/billing`, "tutor_deactivated");

  return {
    subject: `${data.subject} tutor deactivated for ${data.learnerName}`,
    html: baseLayout({
      title: "AI Tutor Deactivated",
      preheader: `${data.learnerName}'s ${data.subject} tutor has been deactivated.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">AI Tutor deactivated</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">The <strong>${escapeHtml(data.tutorName)}</strong> AI tutor for <strong>${escapeHtml(data.subject)}</strong> has been deactivated for <strong>${escapeHtml(data.learnerName)}</strong>.</p>
        <p style="margin: 0 0 16px;">${escapeHtml(data.learnerName)} will still have access to the tutor until <strong>${escapeHtml(data.gracePeriodEnd)}</strong> (grace period).</p>
        <p style="margin: 0 0 16px;">All progress and learning data has been preserved. You can reactivate the tutor at any time from your billing settings.</p>
        ${ctaButton("Manage Subscription", cta)}
      `,
    }),
  };
}
