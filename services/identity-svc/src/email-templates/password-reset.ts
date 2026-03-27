import { emailLayout, ctaButton } from "./layout.js";

export function passwordResetTemplate(name: string, resetUrl: string): string {
  return emailLayout("Reset Your Password", `
    <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Reset your password</h2>
    <p style="margin: 0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin: 0 0 16px;">We received a request to reset your password. Click the button below to choose a new password. This link expires in 1 hour.</p>
    ${ctaButton("Reset Password", resetUrl)}
    <p style="margin: 0 0 16px; font-size: 14px; color: #6C757D;">If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
    <hr style="border: none; border-top: 1px solid #E9ECEF; margin: 24px 0;">
    <p style="margin: 0; font-size: 12px; color: #ADB5BD;">If the button doesn't work, copy and paste this URL into your browser: ${escapeHtml(resetUrl)}</p>
  `);
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
