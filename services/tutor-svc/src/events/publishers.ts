"""NATS event publishers for tutor-svc."""
import type { NatsConnection } from "nats";
import { publishEvent } from "@aivo/events";

export async function publishTutorSessionStarted(
  nc: NatsConnection,
  data: { learnerId: string; tutorSku: string; sessionId: string },
) {
  await publishEvent(nc, "tutor.session.started", data);
}

export async function publishTutorSessionCompleted(
  nc: NatsConnection,
  data: {
    learnerId: string;
    tutorSku: string;
    sessionId: string;
    masteryUpdates: Record<string, unknown>;
    engagementMetrics: Record<string, unknown>;
  },
) {
  await publishEvent(nc, "tutor.session.completed", data);
}

export async function publishTutorAddonActivated(
  nc: NatsConnection,
  data: { learnerId: string; tenantId: string; sku: string; subject: string },
) {
  await publishEvent(nc, "tutor.addon.activated", data);
}

export async function publishTutorAddonDeactivated(
  nc: NatsConnection,
  data: { learnerId: string; tenantId: string; sku: string },
) {
  await publishEvent(nc, "tutor.addon.deactivated", data);
}

export async function publishHomeworkUploaded(
  nc: NatsConnection,
  data: { learnerId: string; assignmentId: string; subject: string; fileUrl: string },
) {
  await publishEvent(nc, "homework.uploaded", data);
}

export async function publishHomeworkProcessed(
  nc: NatsConnection,
  data: { learnerId: string; assignmentId: string; problemCount: number },
) {
  await publishEvent(nc, "homework.processed", data);
}

export async function publishHomeworkSessionStarted(
  nc: NatsConnection,
  data: { learnerId: string; assignmentId: string; sessionId: string },
) {
  await publishEvent(nc, "homework.session.started", data);
}

export async function publishHomeworkSessionCompleted(
  nc: NatsConnection,
  data: {
    learnerId: string;
    assignmentId: string;
    sessionId: string;
    subject: string;
    completionQuality: number;
    problemsCompleted: number;
    hintsUsed: number;
    durationSeconds: number;
  },
) {
  await publishEvent(nc, "homework.session.completed", data);
}

export async function publishNotification(
  nc: NatsConnection,
  data: { userId: string; type: string; title: string; body: string; actionUrl?: string },
) {
  await publishEvent(nc, "comms.notification.created", data);
}
