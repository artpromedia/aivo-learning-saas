import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface IncidentResolvedData {
  title: string;
  resolvedAt: string;
  statusPageUrl: string;
  unsubscribeUrl?: string;
}

export function incidentResolvedTemplate(data: IncidentResolvedData): { subject: string; html: string } {
  const cta = utmUrl(data.statusPageUrl, "incident_resolved");

  return {
    subject: `Resolved: ${data.title} — AIVO Learning`,
    html: baseLayout({
      title: `Resolved: ${escapeHtml(data.title)}`,
      preheader: `${data.title} has been resolved.`,
      unsubscribeUrl: data.unsubscribeUrl,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Resolved: ${escapeHtml(data.title)}</h2>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.title)}</strong> has been resolved.</p>
        <p style="margin: 0 0 16px;"><strong>Resolved at:</strong> ${escapeHtml(data.resolvedAt)}</p>
        ${ctaButton("View Status Page", cta)}
        <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
