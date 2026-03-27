import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface HomeworkReadyData {
  userName: string;
  learnerName: string;
  subject: string;
  problemCount: number;
  startUrl: string;
}

export function homeworkReadyTemplate(data: HomeworkReadyData): { subject: string; html: string } {
  const cta = utmUrl(data.startUrl, "homework_ready");

  return {
    subject: `${data.learnerName}'s ${data.subject} homework is ready!`,
    html: baseLayout({
      title: "Homework Ready",
      preheader: `${data.learnerName}'s ${data.subject} homework with ${data.problemCount} problems is ready to start.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Homework is ready!</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.learnerName)}</strong>'s <strong>${escapeHtml(data.subject)}</strong> homework has been processed and is ready to start. It contains <strong>${data.problemCount} problem${data.problemCount !== 1 ? "s" : ""}</strong> adapted to ${escapeHtml(data.learnerName)}'s current level.</p>
        <p style="margin: 0 0 16px;">The problems have been personalized based on ${escapeHtml(data.learnerName)}'s brain profile to provide the right level of challenge and support.</p>
        ${ctaButton("Start Homework", cta)}
      `,
    }),
  };
}
