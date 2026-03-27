import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface TutorActivatedData {
  userName: string;
  tutorName: string;
  subject: string;
  learnerName: string;
  appUrl: string;
}

export function tutorActivatedTemplate(data: TutorActivatedData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/learners/${encodeURIComponent(data.learnerName)}/tutor`, "tutor_activated");

  return {
    subject: `${data.subject} tutor activated for ${data.learnerName}!`,
    html: baseLayout({
      title: "AI Tutor Activated",
      preheader: `Great news! ${data.learnerName}'s ${data.subject} AI tutor is ready.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">AI Tutor activated!</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Great news! The <strong>${escapeHtml(data.tutorName)}</strong> AI tutor for <strong>${escapeHtml(data.subject)}</strong> has been activated for <strong>${escapeHtml(data.learnerName)}</strong>.</p>
        <p style="margin: 0 0 16px;">The tutor will:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px; color: #212529;">
          <li style="margin-bottom: 8px;">Adapt to ${escapeHtml(data.learnerName)}'s unique learning profile</li>
          <li style="margin-bottom: 8px;">Provide personalized practice and explanations</li>
          <li style="margin-bottom: 8px;">Track mastery progress in real-time</li>
        </ul>
        ${ctaButton("Start Tutoring Session", cta)}
      `,
    }),
  };
}
