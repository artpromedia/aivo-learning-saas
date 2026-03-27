import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface EmailVerificationData {
  userName: string;
  verificationUrl: string;
  expiresIn: string;
}

export function emailVerificationTemplate(data: EmailVerificationData): { subject: string; html: string } {
  const cta = utmUrl(data.verificationUrl, "email_verification");

  return {
    subject: "Verify your email address — AIVO Learning",
    html: baseLayout({
      title: "Verify Your Email",
      preheader: "Please verify your email address to complete your AIVO Learning registration.",
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Verify your email</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Please verify your email address to complete your registration and start using AIVO Learning.</p>
        ${ctaButton("Verify Email Address", cta)}
        <p class="text-muted" style="margin: 0 0 16px; color: #6C757D; font-size: 14px;">This link expires in ${escapeHtml(data.expiresIn)}. If you didn't create an account, you can safely ignore this email.</p>
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">If the button doesn't work, copy and paste this URL into your browser:<br><a href="${escapeHtml(cta)}" style="color: #7C3AED; word-break: break-all;">${escapeHtml(cta)}</a></p>
      `,
    }),
  };
}
