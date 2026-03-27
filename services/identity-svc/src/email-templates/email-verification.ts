import { emailLayout, ctaButton } from "./layout.js";

export function emailVerificationTemplate(name: string, verificationUrl: string): string {
  return emailLayout("Verify Your Email", `
    <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Verify your email address</h2>
    <p style="margin: 0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin: 0 0 16px;">Please verify your email address to complete your AIVO Learning account setup. This link expires in 24 hours.</p>
    ${ctaButton("Verify Email", verificationUrl)}
    <p style="margin: 0 0 16px; font-size: 14px; color: #6C757D;">If you didn't create an account with AIVO Learning, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #E9ECEF; margin: 24px 0;">
    <p style="margin: 0; font-size: 12px; color: #ADB5BD;">If the button doesn't work, copy and paste this URL into your browser: ${escapeHtml(verificationUrl)}</p>
  `);
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
