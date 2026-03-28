import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface SisEnrollmentNotificationData {
  parentName: string;
  learnerName: string;
  schoolName: string;
  onboardingUrl: string;
  isExistingParent: boolean;
}

export function sisEnrollmentNotificationTemplate(data: SisEnrollmentNotificationData): { subject: string; html: string } {
  const onboardCta = utmUrl(data.onboardingUrl, "sis_enrollment");

  if (data.isExistingParent) {
    return {
      subject: `${data.learnerName}'s school has connected to AIVO`,
      html: baseLayout({
        title: "School Connected",
        preheader: `${data.schoolName} has connected to AIVO. Your existing Brain data is preserved.`,
        body: `
          <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">${escapeHtml(data.schoolName)} is now connected</h2>
          <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.parentName)},</p>
          <p style="margin: 0 0 16px;"><strong>${escapeHtml(data.learnerName)}</strong>'s school has connected to AIVO. Your existing Brain data is fully preserved and your child's teacher has been assigned as a profile collaborator.</p>
          <p style="margin: 0 0 16px;">No action is required on your part. Your child can continue learning right where they left off.</p>
          ${ctaButton("View Dashboard", onboardCta)}
        `,
      }),
    };
  }

  return {
    subject: `${data.learnerName} has been enrolled in AIVO by ${data.schoolName}`,
    html: baseLayout({
      title: "Welcome to AIVO",
      preheader: `Complete ${data.learnerName}'s learning profile to get started.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Welcome to AIVO!</h2>
        <p style="margin: 0 0 16px;">Hi ${escapeHtml(data.parentName)},</p>
        <p style="margin: 0 0 16px;">Your child <strong>${escapeHtml(data.learnerName)}</strong> has been enrolled in AIVO by <strong>${escapeHtml(data.schoolName)}</strong>.</p>
        <p style="margin: 0 0 16px;">AIVO creates a personalized Brain profile that adapts to your child's unique learning style. To get started, complete your child's learning profile:</p>
        <ul style="margin: 0 0 16px; padding-left: 24px;">
          <li style="margin-bottom: 8px;">Set up your parent account</li>
          <li style="margin-bottom: 8px;">Review your child's learning preferences</li>
          <li style="margin-bottom: 8px;">Optionally upload IEP documents for personalized accommodations</li>
        </ul>
        <p style="margin: 0 0 16px;">Your child's teacher has been assigned as a profile collaborator and can help customize the learning experience.</p>
        ${ctaButton("Complete Learning Profile", onboardCta)}
      `,
    }),
  };
}
