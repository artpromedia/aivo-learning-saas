import { baseLayout, escapeHtml } from "../base-layout.js";

export interface CareerApplicationData {
  applicantName: string;
  applicantEmail: string;
  position: string;
  resumeFilename: string;
}

export function careerApplicationTemplate(data: CareerApplicationData): { subject: string; html: string } {
  return {
    subject: `New Application: ${data.position} — ${data.applicantName}`,
    html: baseLayout({
      title: "New Career Application",
      preheader: `${data.applicantName} applied for ${data.position}`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">New Career Application</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #495057; border-bottom: 1px solid #eee; width: 140px;">Name</td>
            <td style="padding: 8px 12px; color: #212529; border-bottom: 1px solid #eee;">${escapeHtml(data.applicantName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #495057; border-bottom: 1px solid #eee;">Email</td>
            <td style="padding: 8px 12px; color: #212529; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.applicantEmail)}" style="color: #6c63ff;">${escapeHtml(data.applicantEmail)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #495057; border-bottom: 1px solid #eee;">Position</td>
            <td style="padding: 8px 12px; color: #212529; border-bottom: 1px solid #eee;">${escapeHtml(data.position)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #495057;">Resume</td>
            <td style="padding: 8px 12px; color: #212529;">${escapeHtml(data.resumeFilename)} (attached)</td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 14px; color: #6c757d;">This application was submitted via the AIVO careers page.</p>
      `,
    }),
  };
}
