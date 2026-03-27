import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface LeadConfirmationData {
  contactName: string;
  companyName: string;
  demoDate: string;
  appUrl: string;
}

export function leadConfirmationTemplate(data: LeadConfirmationData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/demo`, "lead_confirmation");

  return {
    subject: "Your AIVO Learning demo is confirmed!",
    html: baseLayout({
      title: "Demo Confirmed",
      preheader: `Your demo with AIVO Learning is confirmed for ${data.demoDate}.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Demo confirmed!</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.contactName)},</p>
        <p style="margin: 0 0 16px;">Thank you for your interest in AIVO Learning for <strong>${escapeHtml(data.companyName)}</strong>. Your demo is scheduled for <strong>${escapeHtml(data.demoDate)}</strong>.</p>
        <p style="margin: 0 0 16px;">During the demo, we'll show you how AIVO Learning's AI-powered platform can transform education for your students with:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px; color: #212529;">
          <li style="margin-bottom: 8px;">Personalized brain profiles for every learner</li>
          <li style="margin-bottom: 8px;">Adaptive learning paths based on individual needs</li>
          <li style="margin-bottom: 8px;">IEP-aligned goal tracking and recommendations</li>
        </ul>
        ${ctaButton("View Demo Details", cta)}
      `,
    }),
  };
}
