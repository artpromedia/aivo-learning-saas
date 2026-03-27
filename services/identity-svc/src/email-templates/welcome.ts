import { emailLayout } from "./layout.js";

export function welcomeTemplate(name: string): string {
  return emailLayout("Welcome to AIVO Learning", `
    <h2 style="font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px;">Welcome, ${escapeHtml(name)}!</h2>
    <p style="margin: 0 0 16px;">Thank you for joining AIVO Learning. We're excited to help you unlock your child's full learning potential with AI-powered personalized education.</p>
    <p style="margin: 0 0 16px;">Here's what you can do next:</p>
    <ul style="margin: 0 0 16px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Add your child's profile to get started</li>
      <li style="margin-bottom: 8px;">Invite a teacher or caregiver to collaborate</li>
      <li style="margin-bottom: 8px;">Explore personalized learning recommendations</li>
    </ul>
    <p style="margin: 0 0 16px;">If you have any questions, our support team is here to help.</p>
    <p style="margin: 0; color: #6C757D; font-size: 14px;">— The AIVO Learning Team</p>
  `);
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
