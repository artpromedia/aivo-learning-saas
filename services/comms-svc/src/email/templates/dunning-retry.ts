import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface DunningRetryData {
  userName: string;
  retryDate: string;
  updatePaymentUrl: string;
}

export function dunningRetryTemplate(data: DunningRetryData): { subject: string; html: string } {
  const cta = utmUrl(data.updatePaymentUrl, "dunning_retry");

  return {
    subject: "Action required: Payment failed — AIVO Learning",
    html: baseLayout({
      title: "Payment Failed",
      preheader: "We couldn't process your payment. Please update your payment method to avoid service interruption.",
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Payment couldn't be processed</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">We were unable to process your most recent payment. Don't worry — we'll automatically retry on <strong>${escapeHtml(data.retryDate)}</strong>.</p>
        <p style="margin: 0 0 16px;">To avoid any interruption to your service, please update your payment method before the retry date.</p>
        ${ctaButton("Update Payment Method", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">If you've already updated your payment method, you can ignore this email. We'll process the payment automatically on the retry date.</p>
      `,
    }),
  };
}
