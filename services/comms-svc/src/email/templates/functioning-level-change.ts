import { baseLayout, ctaButton, utmUrl, escapeHtml, infoTable, infoRow } from "../base-layout.js";

export interface FunctioningLevelChangeData {
  userName: string;
  previousLevel: string;
  newLevel: string;
  learnerName: string;
  appUrl: string;
}

export function functioningLevelChangeTemplate(data: FunctioningLevelChangeData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/learners/${encodeURIComponent(data.learnerName)}/brain`, "functioning_level_change");
  const levelDisplay = (level: string) => level.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    subject: `Functioning level update for ${data.learnerName}`,
    html: baseLayout({
      title: "Functioning Level Update",
      preheader: `${data.learnerName}'s functioning level has been updated based on learning data.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Functioning level updated</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.userName)},</p>
        <p style="margin: 0 0 16px;">Based on ongoing learning data analysis, <strong>${escapeHtml(data.learnerName)}</strong>'s functioning level has been updated:</p>
        ${infoTable(
          infoRow("Previous level", levelDisplay(data.previousLevel)) +
          infoRow("New level", levelDisplay(data.newLevel))
        )}
        <p style="margin: 0 0 16px;">This change means AIVO Learning will adjust content delivery, interaction modes, and accommodations to better match ${escapeHtml(data.learnerName)}'s current needs.</p>
        ${ctaButton("View Brain Profile", cta)}
        <p class="text-muted" style="margin: 0; color: #6C757D; font-size: 14px;">If you believe this change doesn't reflect ${escapeHtml(data.learnerName)}'s current abilities, you can review and adjust the setting in their profile.</p>
      `,
    }),
  };
}
