import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface IncidentCreatedData {
  title: string;
  impact: string;
  message: string;
  services: string[];
  statusPageUrl: string;
  unsubscribeUrl?: string;
}

export function incidentCreatedTemplate(data: IncidentCreatedData): { subject: string; html: string } {
  const cta = utmUrl(data.statusPageUrl, "incident_created");
  const serviceList = data.services.map(s => escapeHtml(s)).join(", ");

  return {
    subject: `Service Issue: ${data.title} — AIVO Learning`,
    html: baseLayout({
      title: `Service Issue: ${escapeHtml(data.title)}`,
      preheader: `We're investigating an issue affecting ${serviceList}.`,
      unsubscribeUrl: data.unsubscribeUrl,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Service Issue: ${escapeHtml(data.title)}</h2>
        <p style="margin: 0 0 16px;">We're investigating an issue affecting the following services: <strong>${serviceList}</strong>.</p>
        <p style="margin: 0 0 16px;"><strong>Impact:</strong> ${escapeHtml(data.impact)}</p>
        <p style="margin: 0 0 16px;">${escapeHtml(data.message)}</p>
        ${ctaButton("View Status Page", cta)}
        <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
