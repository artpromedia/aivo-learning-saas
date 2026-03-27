import { emailLayout } from "./layout.js";

export function subscriptionConfirmationTemplate(name: string, planName: string): string {
  return emailLayout("Subscription Confirmed", `
    <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Subscription Confirmed!</h2>
    <p style="margin: 0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin: 0 0 16px;">Your <strong>${escapeHtml(planName)}</strong> subscription to AIVO Learning is now active.</p>
    <p style="margin: 0 0 16px;">You now have access to all the features included in your plan. Here's a quick summary:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px; border: 1px solid #E9ECEF; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="padding: 12px 16px; background-color: #F8F9FA; font-weight: 600; border-bottom: 1px solid #E9ECEF;">Plan</td>
        <td style="padding: 12px 16px; background-color: #F8F9FA; border-bottom: 1px solid #E9ECEF;">${escapeHtml(planName)}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600;">Status</td>
        <td style="padding: 12px 16px; color: #4CAF50; font-weight: 600;">Active</td>
      </tr>
    </table>
    <p style="margin: 0 0 16px;">Thank you for choosing AIVO Learning. We're committed to providing the best personalized learning experience for your family.</p>
    <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
  `);
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
