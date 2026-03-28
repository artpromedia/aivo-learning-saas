import { baseLayout, escapeHtml } from "../base-layout.js";

export interface DataDeletionConfirmationData {
  userName: string;
  learnerId: string;
}

export function dataDeletionConfirmationTemplate(data: DataDeletionConfirmationData): { subject: string; html: string } {
  return {
    subject: "Your child's data has been permanently deleted",
    html: baseLayout({
      title: "Data Deletion Complete",
      preheader: "All data associated with your learner has been permanently deleted.",
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Data Deletion Confirmation</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">As requested, <strong>all data</strong> associated with your child's AIVO Brain profile has been <strong>permanently and irreversibly deleted</strong>.</p>
        <p style="margin: 0 0 16px;">This includes:</p>
        <ul style="margin: 0 0 16px; padding-left: 24px;">
          <li style="margin-bottom: 8px;">Brain state and all historical snapshots</li>
          <li style="margin-bottom: 8px;">All learning session data</li>
          <li style="margin-bottom: 8px;">Mastery progression history</li>
          <li style="margin-bottom: 8px;">IEP documents and parsed data</li>
          <li style="margin-bottom: 8px;">Tutor and homework sessions</li>
          <li style="margin-bottom: 8px;">Gamification data (XP, badges, quests)</li>
          <li style="margin-bottom: 8px;">All recommendations and insights</li>
        </ul>
        <p style="margin: 0 0 16px; font-size: 13px; color: #6c757d;">A compliance audit record of this deletion has been retained in accordance with GDPR Article 17(3). The user record has been anonymized.</p>
        <p style="margin: 0 0 16px;">If you'd like to start fresh, you can always create a new account at any time.</p>
      `,
    }),
  };
}
