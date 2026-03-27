import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface StreakBrokenData {
  userName: string;
  previousStreak: number;
  learnerName: string;
  resumeUrl: string;
}

export function streakBrokenTemplate(data: StreakBrokenData): { subject: string; html: string } {
  const cta = utmUrl(data.resumeUrl, "streak_broken");

  return {
    subject: `${data.learnerName}'s ${data.previousStreak}-day streak ended`,
    html: baseLayout({
      title: "Streak Ended",
      preheader: `${data.learnerName}'s ${data.previousStreak}-day learning streak has ended. Start a new one today!`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Streak ended</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.learnerName)}</strong>'s <strong>${data.previousStreak}-day</strong> learning streak has come to an end. That's still an impressive achievement!</p>
        <p style="margin: 0 0 16px;">The best time to start a new streak is today. Even a quick 5-minute session counts toward building a new streak.</p>
        ${ctaButton("Start a New Streak", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">Consistency is key to learning success. Help ${escapeHtml(data.learnerName)} build a new streak starting today!</p>
      `,
    }),
  };
}
