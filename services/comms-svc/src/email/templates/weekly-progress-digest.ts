import { baseLayout, ctaButton, utmUrl, escapeHtml, infoTable, infoRow } from "../base-layout.js";

export interface WeeklyProgressDigestData {
  userName: string;
  learnerName: string;
  weekSummary: string;
  xpEarned: number;
  lessonsCompleted: number;
  streakDays: number;
  masteryChanges: Array<{ subject: string; direction: "improved" | "declined"; delta: string }>;
  recommendations: string[];
  appUrl: string;
}

export function weeklyProgressDigestTemplate(data: WeeklyProgressDigestData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/learners/${encodeURIComponent(data.learnerName)}/dashboard`, "weekly_digest");

  const masteryHtml = data.masteryChanges.length > 0
    ? `<div style="margin: 0 0 16px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #212529; font-size: 14px;">MASTERY CHANGES</p>
        ${data.masteryChanges.map((m) => `<p style="margin: 0 0 4px; font-size: 14px;">${m.direction === "improved" ? "📈" : "📉"} <strong>${escapeHtml(m.subject)}</strong>: ${m.direction} by ${escapeHtml(m.delta)}</p>`).join("")}
      </div>`
    : "";

  const recommendationsHtml = data.recommendations.length > 0
    ? `<div style="margin: 0 0 16px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #212529; font-size: 14px;">RECOMMENDATIONS</p>
        <ul style="margin: 0; padding-left: 20px;">
          ${data.recommendations.map((r) => `<li style="margin-bottom: 4px; font-size: 14px; color: #212529;">${escapeHtml(r)}</li>`).join("")}
        </ul>
      </div>`
    : "";

  return {
    subject: `${data.learnerName}'s weekly progress report`,
    html: baseLayout({
      title: "Weekly Progress Digest",
      preheader: `${data.learnerName} earned ${data.xpEarned} XP and completed ${data.lessonsCompleted} lessons this week.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">${escapeHtml(data.learnerName)}'s weekly progress</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">${escapeHtml(data.weekSummary)}</p>

        <div style="background-color: #F5F0FF; border-radius: 8px; padding: 20px; margin: 0 0 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center; padding: 8px;">
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #7C3AED;">${data.xpEarned}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #6C757D; text-transform: uppercase; letter-spacing: 0.05em;">XP Earned</p>
              </td>
              <td style="text-align: center; padding: 8px;">
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #7C3AED;">${data.lessonsCompleted}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #6C757D; text-transform: uppercase; letter-spacing: 0.05em;">Lessons</p>
              </td>
              <td style="text-align: center; padding: 8px;">
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #7C3AED;">${data.streakDays}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #6C757D; text-transform: uppercase; letter-spacing: 0.05em;">Streak Days</p>
              </td>
            </tr>
          </table>
        </div>

        ${masteryHtml}
        ${recommendationsHtml}

        ${ctaButton("View Full Dashboard", cta)}
      `,
    }),
  };
}
