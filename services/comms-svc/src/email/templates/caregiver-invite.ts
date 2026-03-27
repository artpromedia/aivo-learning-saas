import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface CaregiverInviteData {
  parentName: string;
  learnerName: string;
  acceptUrl: string;
}

export function caregiverInviteTemplate(data: CaregiverInviteData): { subject: string; html: string } {
  const cta = utmUrl(data.acceptUrl, "caregiver_invite");

  return {
    subject: `Join ${data.learnerName}'s learning team on AIVO`,
    html: baseLayout({
      title: "Caregiver Invitation",
      preheader: `${data.parentName} wants you to help support ${data.learnerName}'s learning journey.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">You're invited as a caregiver!</h2>
        <p style="margin: 0 0 16px;">${escapeHtml(data.parentName)} has invited you to join <strong>${escapeHtml(data.learnerName)}</strong>'s learning team as a caregiver on AIVO Learning.</p>
        <p style="margin: 0 0 16px;">As a caregiver, you'll receive updates on ${escapeHtml(data.learnerName)}'s progress and be able to support their learning journey alongside the family.</p>
        ${ctaButton("Accept Caregiver Invitation", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      `,
    }),
  };
}
