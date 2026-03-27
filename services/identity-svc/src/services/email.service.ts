import type { FastifyInstance } from "fastify";
import type { EmailClient } from "../plugins/email.js";
import { welcomeTemplate } from "../email-templates/welcome.js";
import { emailVerificationTemplate } from "../email-templates/email-verification.js";
import { passwordResetTemplate } from "../email-templates/password-reset.js";
import { invitationTemplate } from "../email-templates/invitation.js";
import { caregiverInviteTemplate } from "../email-templates/caregiver-invite.js";
import { subscriptionConfirmationTemplate } from "../email-templates/subscription-confirmation.js";

export type TemplateName =
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "invitation"
  | "caregiver_invite"
  | "subscription_confirmation";

interface TemplateData {
  recipientName: string;
  [key: string]: unknown;
}

const TEMPLATES: Record<TemplateName, (data: TemplateData) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: "Welcome to AIVO Learning!",
    html: welcomeTemplate(data.recipientName),
  }),
  email_verification: (data) => ({
    subject: "Verify your AIVO Learning email",
    html: emailVerificationTemplate(
      data.recipientName,
      data.verificationUrl as string,
    ),
  }),
  password_reset: (data) => ({
    subject: "Reset your AIVO Learning password",
    html: passwordResetTemplate(
      data.recipientName,
      data.resetUrl as string,
    ),
  }),
  invitation: (data) => ({
    subject: `You're invited to join AIVO Learning as a Teacher`,
    html: invitationTemplate(
      data.recipientName,
      data.inviterName as string,
      data.learnerName as string,
      data.acceptUrl as string,
    ),
  }),
  caregiver_invite: (data) => ({
    subject: `You're invited to join AIVO Learning as a Caregiver`,
    html: caregiverInviteTemplate(
      data.recipientName,
      data.inviterName as string,
      data.learnerName as string,
      data.acceptUrl as string,
    ),
  }),
  subscription_confirmation: (data) => ({
    subject: "Your AIVO Learning subscription is confirmed",
    html: subscriptionConfirmationTemplate(
      data.recipientName,
      data.planName as string,
    ),
  }),
};

export class EmailService {
  private readonly client: EmailClient;

  constructor(private readonly app: FastifyInstance) {
    this.client = app.email;
  }

  async sendTemplate(
    template: TemplateName,
    recipientEmail: string,
    data: TemplateData,
  ) {
    const templateFn = TEMPLATES[template];
    if (!templateFn) {
      throw Object.assign(new Error(`Unknown template: ${template}`), { statusCode: 400 });
    }

    const { subject, html } = templateFn(data);

    await this.client.send({
      to: recipientEmail,
      subject,
      html,
    });

    return { sent: true, template, to: recipientEmail };
  }
}
