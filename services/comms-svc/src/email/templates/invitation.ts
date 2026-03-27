import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface InvitationData {
  inviterName: string;
  learnerName: string;
  role: string;
  acceptUrl: string;
}

export function invitationTemplate(data: InvitationData): { subject: string; html: string } {
  const cta = utmUrl(data.acceptUrl, "invitation");
  const roleDisplay = data.role.toLowerCase().replace("_", " ");

  return {
    subject: `${data.inviterName} invited you to join AIVO Learning`,
    html: baseLayout({
      title: "You're Invited!",
      preheader: `${data.inviterName} has invited you to collaborate on ${data.learnerName}'s learning journey.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">You've been invited!</h2>
        <p style="margin: 0 0 16px;">${escapeHtml(data.inviterName)} has invited you to join AIVO Learning as a <strong>${escapeHtml(roleDisplay)}</strong> for <strong>${escapeHtml(data.learnerName)}</strong>.</p>
        <p style="margin: 0 0 16px;">As a ${escapeHtml(roleDisplay)}, you'll be able to:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px; color: #212529;">
          <li style="margin-bottom: 8px;">Track learning progress and milestones</li>
          <li style="margin-bottom: 8px;">View personalized recommendations</li>
          <li style="margin-bottom: 8px;">Collaborate on ${escapeHtml(data.learnerName)}'s education goals</li>
        </ul>
        ${ctaButton("Accept Invitation", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      `,
    }),
  };
}
