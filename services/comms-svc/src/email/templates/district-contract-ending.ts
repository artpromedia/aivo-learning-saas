import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface DistrictContractEndingData {
  parentName: string;
  learnerName: string;
  schoolName: string;
  contractEndDate: string;
  dataDeletionDate: string;
  exportUrl: string;
  subscribeUrl: string;
}

export function districtContractEndingTemplate(data: DistrictContractEndingData): { subject: string; html: string } {
  const exportCta = utmUrl(data.exportUrl, "district_contract_ending");
  const subscribeCta = utmUrl(data.subscribeUrl, "district_contract_ending");

  return {
    subject: `Action required: ${data.schoolName}'s AIVO subscription is ending`,
    html: baseLayout({
      title: "School Subscription Ending",
      preheader: `${data.learnerName}'s Brain data will be deleted on ${data.dataDeletionDate} unless you take action.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #EF4444; margin: 0 0 16px;">Your school's AIVO subscription is ending</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.parentName)},</p>
        <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.schoolName)}</strong>'s AIVO subscription ends on <strong>${escapeHtml(data.contractEndDate)}</strong>. After a 30-day grace period, <strong>${escapeHtml(data.learnerName)}</strong>'s Brain data will be permanently deleted on <strong>${escapeHtml(data.dataDeletionDate)}</strong>.</p>
        <p style="margin: 0 0 16px;">You have two options to preserve your child's learning data:</p>
        <h3 style="font-size: 16px; font-weight: 600; color: #212529; margin: 0 0 8px;">Option 1: Export Brain Data</h3>
        <p style="margin: 0 0 16px;">Download a complete copy of ${escapeHtml(data.learnerName)}'s learning profile, including brain state, mastery progression, session history, and IEP data.</p>
        ${ctaButton("Export Brain Data", exportCta)}
        <h3 style="font-size: 16px; font-weight: 600; color: #212529; margin: 16px 0 8px;">Option 2: Subscribe Individually</h3>
        <p style="margin: 0 0 16px;">Continue using AIVO with a personal subscription. All of ${escapeHtml(data.learnerName)}'s Brain data will be preserved seamlessly.</p>
        ${ctaButton("Subscribe Now", subscribeCta)}
      `,
    }),
  };
}
