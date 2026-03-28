import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface MaintenanceStartedData {
  title: string;
  statusPageUrl: string;
  unsubscribeUrl?: string;
}

export function maintenanceStartedTemplate(data: MaintenanceStartedData): { subject: string; html: string } {
  const cta = utmUrl(data.statusPageUrl, "maintenance_started");

  return {
    subject: `Maintenance Underway: ${data.title} — AIVO Learning`,
    html: baseLayout({
      title: `Maintenance Underway: ${escapeHtml(data.title)}`,
      preheader: `Scheduled maintenance for ${data.title} is now underway.`,
      unsubscribeUrl: data.unsubscribeUrl,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Maintenance Underway: ${escapeHtml(data.title)}</h2>
        <p style="margin: 0 0 16px;">Scheduled maintenance for <strong>${escapeHtml(data.title)}</strong> is now underway.</p>
        ${ctaButton("View Status Page", cta)}
        <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
