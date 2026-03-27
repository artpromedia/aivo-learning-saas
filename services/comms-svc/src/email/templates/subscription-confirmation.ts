import { baseLayout, ctaButton, utmUrl, escapeHtml, infoTable, infoRow } from "../base-layout.js";

export interface SubscriptionConfirmationData {
  userName: string;
  planName: string;
  price: string;
  nextBillingDate: string;
  appUrl: string;
}

export function subscriptionConfirmationTemplate(data: SubscriptionConfirmationData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/settings/billing`, "subscription_confirmation");

  return {
    subject: `Subscription confirmed — ${data.planName}`,
    html: baseLayout({
      title: "Subscription Confirmed",
      preheader: `Your ${data.planName} subscription is now active. Welcome to AIVO Learning!`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Subscription confirmed!</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)}, your subscription to <strong>${escapeHtml(data.planName)}</strong> is now active.</p>
        ${infoTable(
          infoRow("Plan", data.planName) +
          infoRow("Price", data.price) +
          infoRow("Next billing date", data.nextBillingDate)
        )}
        <p style="margin: 0 0 16px;">You now have full access to all features included in your plan. Start exploring personalized learning for your family today!</p>
        ${ctaButton("View Subscription Details", cta)}
      `,
    }),
  };
}
