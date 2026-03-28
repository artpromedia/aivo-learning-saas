import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface IncidentUpdatedData {
  title: string;
  status: string;
  message: string;
  statusPageUrl: string;
  unsubscribeUrl?: string;
}

export function incidentUpdatedTemplate(data: IncidentUpdatedData): { subject: string; html: string } {
  const cta = utmUrl(data.statusPageUrl, "incident_updated");

  return {
    subject: `Update: ${data.title} — AIVO Learning`,
    html: baseLayout({
      title: `Update: ${escapeHtml(data.title)}`,
      preheader: `Status update on ${data.title}. Current status: ${data.status}.`,
      unsubscribeUrl: data.unsubscribeUrl,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Update: ${escapeHtml(data.title)}</h2>
        <p style="margin: 0 0 16px;">There is a status update on <strong>${escapeHtml(data.title)}</strong>.</p>
        <p style="margin: 0 0 16px;"><strong>Current Status:</strong> ${escapeHtml(data.status)}</p>
        <p style="margin: 0 0 16px;">${escapeHtml(data.message)}</p>
        ${ctaButton("View Status Page", cta)}
        <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
