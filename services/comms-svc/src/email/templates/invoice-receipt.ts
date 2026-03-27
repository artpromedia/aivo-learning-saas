import { baseLayout, ctaButton, utmUrl, escapeHtml, infoTable, infoRow } from "../base-layout.js";

export interface InvoiceReceiptData {
  userName: string;
  amount: string;
  invoiceId: string;
  date: string;
  downloadUrl: string;
}

export function invoiceReceiptTemplate(data: InvoiceReceiptData): { subject: string; html: string } {
  const cta = utmUrl(data.downloadUrl, "invoice_receipt");

  return {
    subject: `Payment receipt — ${data.amount}`,
    html: baseLayout({
      title: "Payment Receipt",
      preheader: `Your payment of ${data.amount} has been processed successfully.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Payment received</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)}, we've received your payment. Here's your receipt:</p>
        ${infoTable(
          infoRow("Amount", data.amount) +
          infoRow("Invoice ID", data.invoiceId) +
          infoRow("Date", data.date)
        )}
        ${ctaButton("Download Invoice", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">This receipt is for your records. If you have questions about this charge, please contact our support team.</p>
      `,
    }),
  };
}
