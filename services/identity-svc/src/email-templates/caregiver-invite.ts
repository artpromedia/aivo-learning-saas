import { emailLayout, ctaButton } from "./layout.js";

export function caregiverInviteTemplate(
  recipientName: string,
  inviterName: string,
  learnerName: string,
  acceptUrl: string,
): string {
  return emailLayout("Caregiver Invitation", `
    <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">You're invited to be a Caregiver!</h2>
    <p style="margin: 0 0 16px;">Hi ${escapeHtml(recipientName)},</p>
    <p style="margin: 0 0 16px;"><strong>${escapeHtml(inviterName)}</strong> has invited you to join AIVO Learning as a caregiver for <strong>${escapeHtml(learnerName)}</strong>.</p>
    <p style="margin: 0 0 16px;">As a caregiver on AIVO Learning, you'll be able to:</p>
    <ul style="margin: 0 0 16px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">View a simplified summary of the learner's progress</li>
      <li style="margin-bottom: 8px;">Submit observations about the learner's behavior</li>
      <li style="margin-bottom: 8px;">Stay connected with the learning team</li>
    </ul>
    ${ctaButton("Accept Invitation", acceptUrl)}
    <p style="margin: 0; font-size: 14px; color: #6C757D;">This invitation expires in 7 days.</p>
  `);
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
