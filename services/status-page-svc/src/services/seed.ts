import type { FastifyInstance } from "fastify";
import { monitoredServices } from "@aivo/db";

const SEED_SERVICES = [
  { name: "identity-svc", displayName: "Identity Service", description: "Authentication and user management", groupName: "Core Platform", port: 3001, isCritical: true, displayOrder: 1 },
  { name: "learning-svc", displayName: "Learning Service", description: "Core learning path and session management", groupName: "Core Platform", port: 3003, isCritical: true, displayOrder: 2 },
  { name: "family-svc", displayName: "Family Service", description: "Family and caregiver management", groupName: "Core Platform", port: 3005, isCritical: false, displayOrder: 3 },
  { name: "billing-svc", displayName: "Billing Service", description: "Subscription and payment processing", groupName: "Core Platform", port: 3008, isCritical: true, displayOrder: 4 },

  { name: "brain-svc", displayName: "Brain Service", description: "Learner cognitive profiling and recommendations", groupName: "AI Services", port: 3002, isCritical: true, displayOrder: 5 },
  { name: "ai-svc", displayName: "AI Service", description: "Content generation and LLM orchestration", groupName: "AI Services", port: 5000, isCritical: true, displayOrder: 6 },
  { name: "tutor-svc", displayName: "Tutor Service", description: "AI tutoring sessions", groupName: "AI Services", port: 3006, isCritical: false, displayOrder: 7 },

  { name: "engagement-svc", displayName: "Engagement Service", description: "Gamification, XP, badges, and streaks", groupName: "Engagement", port: 3004, isCritical: false, displayOrder: 8 },
  { name: "comms-svc", displayName: "Communications Service", description: "Email, push notifications, and WebSocket", groupName: "Engagement", port: 3007, isCritical: false, displayOrder: 9 },

  { name: "admin-svc", displayName: "Admin Service", description: "Platform administration and management", groupName: "Enterprise", port: 3009, isCritical: false, displayOrder: 10 },
  { name: "integrations-svc", displayName: "Integrations Service", description: "Third-party integrations and SSO", groupName: "Enterprise", port: 3010, isCritical: false, displayOrder: 11 },

  { name: "i18n-svc", displayName: "Internationalization Service", description: "Translations and locale management", groupName: "Support", port: 3011, isCritical: false, displayOrder: 12 },
  { name: "assessment-svc", displayName: "Assessment Service", description: "Assessment engine and grading", groupName: "Support", port: 3012, isCritical: false, displayOrder: 13 },
  { name: "status-page-svc", displayName: "Status Page", description: "Platform health and incident management", groupName: "Support", port: 3013, isCritical: false, displayOrder: 14 },

  { name: "web", displayName: "Web Application", description: "Primary web frontend", groupName: "Frontend", port: 3000, isCritical: true, displayOrder: 15 },
  { name: "marketing", displayName: "Marketing Site", description: "Public marketing website", groupName: "Frontend", port: 4000, isCritical: false, displayOrder: 16 },
];

export async function seedMonitoredServices(app: FastifyInstance): Promise<void> {
  for (const svc of SEED_SERVICES) {
    await app.db
      .insert(monitoredServices)
      .values({
        name: svc.name,
        displayName: svc.displayName,
        description: svc.description,
        groupName: svc.groupName,
        healthEndpoint: "/health",
        port: svc.port,
        isCritical: svc.isCritical,
        displayOrder: svc.displayOrder,
        isEnabled: true,
      })
      .onConflictDoNothing();
  }
}
