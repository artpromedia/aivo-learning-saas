import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface IepGoalMetData {
  userName: string;
  goalText: string;
  learnerName: string;
  celebrationMsg: string;
  appUrl: string;
}

export function iepGoalMetTemplate(data: IepGoalMetData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/learners/${encodeURIComponent(data.learnerName)}/iep`, "iep_goal_met");

  return {
    subject: `IEP goal achieved — ${data.learnerName}!`,
    html: baseLayout({
      title: "IEP Goal Met!",
      preheader: `Amazing news! ${data.learnerName} has achieved an IEP goal.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">IEP Goal Achieved! 🎉</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Amazing news! <strong>${escapeHtml(data.learnerName)}</strong> has met the following IEP goal:</p>
        <div style="background-color: #F5F0FF; border-left: 4px solid #7C3AED; padding: 16px; border-radius: 0 8px 8px 0; margin: 0 0 16px;">
          <p style="margin: 0; font-weight: 500; color: #212529;">${escapeHtml(data.goalText)}</p>
        </div>
        <p style="margin: 0 0 16px;">${escapeHtml(data.celebrationMsg)}</p>
        ${ctaButton("View IEP Progress", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">This achievement has been automatically logged in ${escapeHtml(data.learnerName)}'s progress report.</p>
      `,
    }),
  };
}
