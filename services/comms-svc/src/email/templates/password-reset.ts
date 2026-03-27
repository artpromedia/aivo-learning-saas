import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetTemplate(data: PasswordResetData): { subject: string; html: string } {
  const cta = utmUrl(data.resetUrl, "password_reset");

  return {
    subject: "Reset your password — AIVO Learning",
    html: baseLayout({
      title: "Reset Your Password",
      preheader: "You requested a password reset for your AIVO Learning account.",
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Reset your password</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">We received a request to reset your password. Click the button below to choose a new password.</p>
        ${ctaButton("Reset Password", cta)}
        <p class="text-muted" style="margin: 0 0 16px; color: #6C757D; font-size: 14px;">This link expires in ${escapeHtml(data.expiresIn)}. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
      `,
    }),
  };
}
