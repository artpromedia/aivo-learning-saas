import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface ExportReadyData {
  userName: string;
  learnerName: string;
  downloadUrl: string;
  expiresAt: string;
}

export function exportReadyTemplate(data: ExportReadyData): { subject: string; html: string } {
  const cta = utmUrl(data.downloadUrl, "export_ready");

  return {
    subject: `${data.learnerName}'s Brain data export is ready`,
    html: baseLayout({
      title: "Data Export Ready",
      preheader: `Your data export for ${data.learnerName} is ready for download.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Your data export is ready</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">The Brain data export for <strong>${escapeHtml(data.learnerName)}</strong> has been generated and is ready for download.</p>
        <p style="margin: 0 0 16px;">The export includes all Brain states, session history, mastery progression, IEP data, tutor sessions, homework sessions, and gamification data in both human-readable and machine-readable formats.</p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6c757d;">This download link expires on ${escapeHtml(data.expiresAt)}.</p>
        ${ctaButton("Download Export", cta)}
      `,
    }),
  };
}
