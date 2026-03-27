import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface BrainProfileRevealData {
  userName: string;
  learnerName: string;
  profileSummary: string;
  reviewUrl: string;
}

export function brainProfileRevealTemplate(data: BrainProfileRevealData): { subject: string; html: string } {
  const cta = utmUrl(data.reviewUrl, "brain_profile_reveal");

  return {
    subject: `${data.learnerName}'s brain profile is ready!`,
    html: baseLayout({
      title: "Brain Profile Ready",
      preheader: `${data.learnerName}'s personalized brain profile has been created and is ready for review.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">${escapeHtml(data.learnerName)}'s brain profile is ready!</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">We've created a personalized brain profile for <strong>${escapeHtml(data.learnerName)}</strong>. This profile powers all adaptive learning, recommendations, and content personalization in AIVO Learning.</p>
        <div style="background-color: #F5F0FF; border-radius: 8px; padding: 16px; margin: 0 0 16px;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #5530CC; font-size: 14px;">PROFILE SUMMARY</p>
          <p style="margin: 0; color: #212529;">${escapeHtml(data.profileSummary)}</p>
        </div>
        <p style="margin: 0 0 16px;">Review the full profile to understand how AIVO Learning adapts to ${escapeHtml(data.learnerName)}'s unique learning style.</p>
        ${ctaButton("Review Brain Profile", cta)}
      `,
    }),
  };
}
