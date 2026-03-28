import { welcomeTemplate, type WelcomeData } from "./templates/welcome.js";
import { emailVerificationTemplate, type EmailVerificationData } from "./templates/email-verification.js";
import { passwordResetTemplate, type PasswordResetData } from "./templates/password-reset.js";
import { invitationTemplate, type InvitationData } from "./templates/invitation.js";
import { caregiverInviteTemplate, type CaregiverInviteData } from "./templates/caregiver-invite.js";
import { subscriptionConfirmationTemplate, type SubscriptionConfirmationData } from "./templates/subscription-confirmation.js";
import { invoiceReceiptTemplate, type InvoiceReceiptData } from "./templates/invoice-receipt.js";
import { dunningRetryTemplate, type DunningRetryData } from "./templates/dunning-retry.js";
import { dunningSuspendTemplate, type DunningSuspendData } from "./templates/dunning-suspend.js";
import { leadConfirmationTemplate, type LeadConfirmationData } from "./templates/lead-confirmation.js";
import { nurtureSequenceTemplate, type NurtureSequenceData } from "./templates/nurture-sequence.js";
import { tutorActivatedTemplate, type TutorActivatedData } from "./templates/tutor-activated.js";
import { tutorDeactivatedTemplate, type TutorDeactivatedData } from "./templates/tutor-deactivated.js";
import { homeworkReadyTemplate, type HomeworkReadyData } from "./templates/homework-ready.js";
import { iepGoalMetTemplate, type IepGoalMetData } from "./templates/iep-goal-met.js";
import { iepRefreshReminderTemplate, type IepRefreshReminderData } from "./templates/iep-refresh-reminder.js";
import { functioningLevelChangeTemplate, type FunctioningLevelChangeData } from "./templates/functioning-level-change.js";
import { brainProfileRevealTemplate, type BrainProfileRevealData } from "./templates/brain-profile-reveal.js";
import { streakBrokenTemplate, type StreakBrokenData } from "./templates/streak-broken.js";
import { badgeEarnedTemplate, type BadgeEarnedData } from "./templates/badge-earned.js";
import { weeklyProgressDigestTemplate, type WeeklyProgressDigestData } from "./templates/weekly-progress-digest.js";
import { regressionRollbackOfferTemplate, type RegressionRollbackOfferData } from "./templates/regression-rollback-offer.js";
import { teacherInsightTemplate, type TeacherInsightData } from "./templates/teacher-insight.js";
import { gracePeriodStartedTemplate, type GracePeriodStartedData } from "./templates/grace-period-started.js";
import { gracePeriodWarningTemplate, type GracePeriodWarningData } from "./templates/grace-period-warning.js";
import { exportReadyTemplate, type ExportReadyData } from "./templates/export-ready.js";
import { dataDeletionConfirmationTemplate, type DataDeletionConfirmationData } from "./templates/data-deletion-confirmation.js";

export type TemplateSlug =
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "invitation"
  | "caregiver_invite"
  | "subscription_confirmation"
  | "invoice_receipt"
  | "dunning_retry"
  | "dunning_suspend"
  | "lead_confirmation"
  | "nurture_sequence"
  | "tutor_activated"
  | "tutor_deactivated"
  | "homework_ready"
  | "iep_goal_met"
  | "iep_refresh_reminder"
  | "functioning_level_change"
  | "brain_profile_reveal"
  | "streak_broken"
  | "badge_earned"
  | "weekly_progress_digest"
  | "regression_rollback_offer"
  | "teacher_insight"
  | "grace_period_started"
  | "grace_period_warning"
  | "export_ready"
  | "data_deletion_confirmation";

export type TemplateDataMap = {
  welcome: WelcomeData;
  email_verification: EmailVerificationData;
  password_reset: PasswordResetData;
  invitation: InvitationData;
  caregiver_invite: CaregiverInviteData;
  subscription_confirmation: SubscriptionConfirmationData;
  invoice_receipt: InvoiceReceiptData;
  dunning_retry: DunningRetryData;
  dunning_suspend: DunningSuspendData;
  lead_confirmation: LeadConfirmationData;
  nurture_sequence: NurtureSequenceData;
  tutor_activated: TutorActivatedData;
  tutor_deactivated: TutorDeactivatedData;
  homework_ready: HomeworkReadyData;
  iep_goal_met: IepGoalMetData;
  iep_refresh_reminder: IepRefreshReminderData;
  functioning_level_change: FunctioningLevelChangeData;
  brain_profile_reveal: BrainProfileRevealData;
  streak_broken: StreakBrokenData;
  badge_earned: BadgeEarnedData;
  weekly_progress_digest: WeeklyProgressDigestData;
  regression_rollback_offer: RegressionRollbackOfferData;
  teacher_insight: TeacherInsightData;
  grace_period_started: GracePeriodStartedData;
  grace_period_warning: GracePeriodWarningData;
  export_ready: ExportReadyData;
  data_deletion_confirmation: DataDeletionConfirmationData;
};

const templateRenderers: { [K in TemplateSlug]: (data: TemplateDataMap[K]) => { subject: string; html: string } } = {
  welcome: welcomeTemplate,
  email_verification: emailVerificationTemplate,
  password_reset: passwordResetTemplate,
  invitation: invitationTemplate,
  caregiver_invite: caregiverInviteTemplate,
  subscription_confirmation: subscriptionConfirmationTemplate,
  invoice_receipt: invoiceReceiptTemplate,
  dunning_retry: dunningRetryTemplate,
  dunning_suspend: dunningSuspendTemplate,
  lead_confirmation: leadConfirmationTemplate,
  nurture_sequence: nurtureSequenceTemplate,
  tutor_activated: tutorActivatedTemplate,
  tutor_deactivated: tutorDeactivatedTemplate,
  homework_ready: homeworkReadyTemplate,
  iep_goal_met: iepGoalMetTemplate,
  iep_refresh_reminder: iepRefreshReminderTemplate,
  functioning_level_change: functioningLevelChangeTemplate,
  brain_profile_reveal: brainProfileRevealTemplate,
  streak_broken: streakBrokenTemplate,
  badge_earned: badgeEarnedTemplate,
  weekly_progress_digest: weeklyProgressDigestTemplate,
  regression_rollback_offer: regressionRollbackOfferTemplate,
  teacher_insight: teacherInsightTemplate,
  grace_period_started: gracePeriodStartedTemplate,
  grace_period_warning: gracePeriodWarningTemplate,
  export_ready: exportReadyTemplate,
  data_deletion_confirmation: dataDeletionConfirmationTemplate,
};

export function renderTemplate<T extends TemplateSlug>(
  slug: T,
  data: TemplateDataMap[T],
): { subject: string; html: string } {
  const renderer = templateRenderers[slug];
  if (!renderer) {
    throw new Error(`Unknown email template: ${slug}`);
  }
  return (renderer as (data: TemplateDataMap[T]) => { subject: string; html: string })(data);
}

export function getAvailableTemplates(): TemplateSlug[] {
  return Object.keys(templateRenderers) as TemplateSlug[];
}
