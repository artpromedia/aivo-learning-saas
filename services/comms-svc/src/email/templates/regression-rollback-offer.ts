import { baseLayout, ctaButton, utmUrl, escapeHtml, infoTable, infoRow } from "../base-layout.js";

export interface RegressionRollbackOfferData {
  userName: string;
  learnerName: string;
  domains: string;
  dropSummary: string;
  rollbackUrl: string;
  appUrl: string;
}

export function regressionRollbackOfferTemplate(data: RegressionRollbackOfferData): { subject: string; html: string } {
  const cta = utmUrl(data.rollbackUrl, "regression_rollback_offer");

  return {
    subject: `Action needed: learning regression detected for ${data.learnerName}`,
    html: baseLayout({
      title: "Learning Regression Detected",
      preheader: `A mastery drop has been detected for ${data.learnerName} since the recent brain upgrade.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Post-upgrade regression detected</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Since the recent brain upgrade, we've detected a significant mastery drop for <strong>${escapeHtml(data.learnerName)}</strong> in the following area(s):</p>
        ${infoTable(
          infoRow("Affected domains", data.domains) +
          infoRow("Drop details", data.dropSummary)
        )}
        <p style="margin: 0 0 16px;">You can choose to roll back to the previous brain version to restore ${escapeHtml(data.learnerName)}'s prior learning state. This will not affect any new content they have completed.</p>
        ${ctaButton("Review & Roll Back", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">If you prefer to keep the current version, no action is needed. Our system will continue to adapt to ${escapeHtml(data.learnerName)}'s learning patterns.</p>
      `,
    }),
  };
}
