import type { NatsConnection } from "nats";
import { publishEvent } from "@aivo/events";

export async function publishRecommendationResponded(
  nc: NatsConnection,
  data: { learnerId: string; recommendationId: string; status: "APPROVED" | "DECLINED" | "ADJUSTED"; parentResponse?: string },
) {
  await publishEvent(nc, "brain.recommendation.responded", data);
}

export async function publishNotification(
  nc: NatsConnection,
  data: { userId: string; type: string; title: string; body: string; actionUrl?: string },
) {
  await publishEvent(nc, "comms.notification.created", data);
}

export async function publishEmailSend(
  nc: NatsConnection,
  data: { templateSlug: string; recipientEmail: string; recipientName: string; templateData: Record<string, unknown>; tags?: string[] },
) {
  await publishEvent(nc, "comms.email.send", { ...data, tags: data.tags ?? [] });
}
