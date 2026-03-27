import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface DunningSuspendData {
  userName: string;
  reactivateUrl: string;
}

export function dunningSuspendTemplate(data: DunningSuspendData): { subject: string; html: string } {
  const cta = utmUrl(data.reactivateUrl, "dunning_suspend");

  return {
    subject: "Your AIVO Learning account has been suspended",
    html: baseLayout({
      title: "Account Suspended",
      preheader: "Your account has been suspended due to payment failure. Reactivate to resume learning.",
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Account suspended</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">After multiple payment attempts, we were unable to process your subscription payment. Your account has been temporarily suspended.</p>
        <p style="margin: 0 0 16px;">Your data is safe and we'll keep it for 90 days. To resume your learning journey, simply reactivate your subscription with a valid payment method.</p>
        ${ctaButton("Reactivate Subscription", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">If you need assistance, please contact our support team at support@aivolearning.com.</p>
      `,
    }),
  };
}
