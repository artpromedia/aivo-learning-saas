import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface BadgeEarnedData {
  userName: string;
  badgeName: string;
  badgeIcon: string;
  learnerName: string;
  appUrl: string;
}

export function badgeEarnedTemplate(data: BadgeEarnedData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/learners/${encodeURIComponent(data.learnerName)}/badges`, "badge_earned");

  return {
    subject: `${data.learnerName} earned a new badge: ${data.badgeName}!`,
    html: baseLayout({
      title: "Badge Earned!",
      preheader: `Congratulations! ${data.learnerName} earned the "${data.badgeName}" badge.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">New badge earned! 🏆</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.learnerName)}</strong> just earned a new badge!</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #F5F0FF 0%, #EDE5FF 100%); border-radius: 16px; padding: 24px 32px;">
            ${data.badgeIcon ? `<img src="${escapeHtml(data.badgeIcon)}" alt="${escapeHtml(data.badgeName)} badge" width="64" height="64" style="display: block; margin: 0 auto 12px; width: 64px; height: 64px;">` : `<div style="width: 64px; height: 64px; margin: 0 auto 12px; background: linear-gradient(135deg, #915ee3 0%, #8143e1 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;"><span style="font-size: 32px;">🏆</span></div>`}
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #5530CC;">${escapeHtml(data.badgeName)}</p>
          </div>
        </div>
        <p style="margin: 0 0 16px;">Celebrate this achievement with ${escapeHtml(data.learnerName)} — every badge represents real progress!</p>
        ${ctaButton("View All Badges", cta)}
      `,
    }),
  };
}
