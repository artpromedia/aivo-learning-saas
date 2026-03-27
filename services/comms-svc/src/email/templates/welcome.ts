import { baseLayout, ctaButton, utmUrl, escapeHtml } from "../base-layout.js";

export interface WelcomeData {
  userName: string;
  appUrl: string;
}

export function welcomeTemplate(data: WelcomeData): { subject: string; html: string } {
  const cta = utmUrl(`${data.appUrl}/dashboard`, "welcome");

  return {
    subject: "Welcome to AIVO Learning!",
    html: baseLayout({
      title: "Welcome to AIVO Learning",
      preheader: `Welcome aboard, ${data.userName}! Let's unlock your child's learning potential.`,
      body: `
        <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Welcome, ${escapeHtml(data.userName)}!</h2>
        <p style="margin: 0 0 16px;">Thank you for joining AIVO Learning. We're excited to help you unlock your child's full learning potential with AI-powered personalized education.</p>
        <p style="margin: 0 0 16px;">Here's what you can do next:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px; color: #212529;">
          <li style="margin-bottom: 8px;">Add your child's profile to get started</li>
          <li style="margin-bottom: 8px;">Upload an IEP document for personalized accommodations</li>
          <li style="margin-bottom: 8px;">Invite a teacher or caregiver to collaborate</li>
          <li style="margin-bottom: 8px;">Explore personalized learning recommendations</li>
        </ul>
        ${ctaButton("Get Started", cta)}
        <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
      `,
    }),
  };
}
