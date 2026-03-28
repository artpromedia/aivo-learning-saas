import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface MaintenanceCompletedData {
  title: string;
  statusPageUrl: string;
  unsubscribeUrl?: string;
}

export function maintenanceCompletedTemplate(data: MaintenanceCompletedData): { subject: string; html: string } {
  const cta = utmUrl(data.statusPageUrl, "maintenance_completed");

  return {
    subject: `Maintenance Completed: ${data.title} — AIVO Learning`,
    html: baseLayout({
      title: `Maintenance Completed: ${escapeHtml(data.title)}`,
      preheader: `${data.title} maintenance has been completed.`,
      unsubscribeUrl: data.unsubscribeUrl,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Maintenance Completed: ${escapeHtml(data.title)}</h2>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.title)}</strong> maintenance has been completed. All services are operating normally.</p>
        ${ctaButton("View Status Page", cta)}
        <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
