import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface MaintenanceScheduledData {
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  statusPageUrl: string;
  unsubscribeUrl?: string;
}

export function maintenanceScheduledTemplate(data: MaintenanceScheduledData): { subject: string; html: string } {
  const cta = utmUrl(data.statusPageUrl, "maintenance_scheduled");

  return {
    subject: `Scheduled Maintenance: ${data.title} — AIVO Learning`,
    html: baseLayout({
      title: `Scheduled Maintenance: ${escapeHtml(data.title)}`,
      preheader: `Maintenance scheduled for ${data.scheduledStart} to ${data.scheduledEnd}.`,
      unsubscribeUrl: data.unsubscribeUrl,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Scheduled Maintenance: ${escapeHtml(data.title)}</h2>
        <p style="margin: 0 0 16px;">We have scheduled maintenance for <strong>${escapeHtml(data.title)}</strong>.</p>
        <p style="margin: 0 0 16px;"><strong>Start:</strong> ${escapeHtml(data.scheduledStart)}</p>
        <p style="margin: 0 0 16px;"><strong>End:</strong> ${escapeHtml(data.scheduledEnd)}</p>
        <p style="margin: 0 0 16px;">${escapeHtml(data.description)}</p>
        ${ctaButton("View Status Page", cta)}
        <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
