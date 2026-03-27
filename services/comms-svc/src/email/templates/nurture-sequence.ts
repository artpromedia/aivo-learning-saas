import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface NurtureSequenceData {
  userName: string;
  sequenceStep: number;
  content: string;
  ctaText: string;
  ctaUrl: string;
}

export function nurtureSequenceTemplate(data: NurtureSequenceData): { subject: string; html: string } {
  const cta = utmUrl(data.ctaUrl, `nurture_step_${data.sequenceStep}`);

  const subjects: Record<number, string> = {
    1: "Getting the most out of AIVO Learning",
    2: "Did you know? AIVO adapts to your child",
    3: "Your child's brain profile is waiting",
    4: "Unlock more with AIVO Learning Pro",
    5: "We'd love your feedback on AIVO Learning",
  };

  return {
    subject: subjects[data.sequenceStep] ?? `AIVO Learning tip #${data.sequenceStep}`,
    html: baseLayout({
      title: "AIVO Learning Tips",
      preheader: "Tips and insights to help you get the most from AIVO Learning.",
      body: `
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <div style="margin: 0 0 16px; line-height: 1.6;">${data.content}</div>
        ${ctaButton(escapeHtml(data.ctaText), cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
