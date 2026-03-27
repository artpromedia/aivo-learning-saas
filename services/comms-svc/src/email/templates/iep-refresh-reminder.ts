import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface IepRefreshReminderData {
  userName: string;
  learnerName: string;
  iepAge: string;
  uploadUrl: string;
}

export function iepRefreshReminderTemplate(data: IepRefreshReminderData): { subject: string; html: string } {
  const cta = utmUrl(data.uploadUrl, "iep_refresh_reminder");

  return {
    subject: `Time to refresh ${data.learnerName}'s IEP document`,
    html: baseLayout({
      title: "IEP Refresh Reminder",
      preheader: `${data.learnerName}'s IEP is ${data.iepAge} old. Consider uploading an updated version.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">IEP refresh reminder</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.learnerName)}</strong>'s IEP document is now <strong>${escapeHtml(data.iepAge)}</strong> old. To ensure AIVO Learning continues to provide the most accurate accommodations and goal tracking, we recommend uploading an updated IEP.</p>
        <p style="margin: 0 0 16px;">An updated IEP helps us:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px; color: #212529;">
          <li style="margin-bottom: 8px;">Align learning recommendations with current goals</li>
          <li style="margin-bottom: 8px;">Update accommodations and support settings</li>
          <li style="margin-bottom: 8px;">Track progress against the latest benchmarks</li>
        </ul>
        ${ctaButton("Upload Updated IEP", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">You can upload a new IEP at any time from ${escapeHtml(data.learnerName)}'s profile settings.</p>
      `,
    }),
  };
}
