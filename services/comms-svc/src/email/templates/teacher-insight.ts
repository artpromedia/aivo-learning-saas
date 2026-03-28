import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface TeacherInsightData {
  userName: string;
  learnerName: string;
  teacherName: string;
  insightText: string;
  reviewUrl: string;
}

export function teacherInsightTemplate(data: TeacherInsightData): { subject: string; html: string } {
  const cta = utmUrl(data.reviewUrl, "teacher_insight");

  return {
    subject: `${data.learnerName}'s teacher shared an observation`,
    html: baseLayout({
      title: "Teacher Observation",
      preheader: `${data.teacherName} has shared an insight about ${data.learnerName}'s progress.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Teacher Observation</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.teacherName)}</strong> has shared an observation about <strong>${escapeHtml(data.learnerName)}</strong>:</p>
        <div style="background: #f8f9fa; border-left: 4px solid #7C3AED; padding: 16px; border-radius: 4px; margin: 0 0 16px;">
          <p style="margin: 0; font-style: italic; color: #495057;">"${escapeHtml(data.insightText)}"</p>
        </div>
        <p style="margin: 0 0 16px;">This observation has been added to ${escapeHtml(data.learnerName)}'s Brain profile and will help personalize their learning experience. You can review this and other recommendations in your dashboard.</p>
        ${ctaButton("Review Recommendations", cta)}
      `,
    }),
  };
}
