import type { NatsConnection } from "nats";
import { publishEvent } from "@aivo/events";

export async function publishSubscriptionCreated(
  nc: NatsConnection,
  data: { tenantId: string; subscriptionId: string; planId: string },
) {
  await publishEvent(nc, "billing.subscription.created", data);
}

export async function publishSubscriptionCancelled(
  nc: NatsConnection,
  data: { tenantId: string; subscriptionId: string; graceEndsAt: string },
) {
  await publishEvent(nc, "billing.subscription.cancelled", data);
}

export async function publishPaymentSucceeded(
  nc: NatsConnection,
  data: { tenantId: string; amount: number; invoiceId: string },
) {
  await publishEvent(nc, "billing.payment.succeeded", data);
}

export async function publishPaymentFailed(
  nc: NatsConnection,
  data: { tenantId: string; invoiceId: string; retryAt: string },
) {
  await publishEvent(nc, "billing.payment.failed", data);
}

export async function publishTutorActivated(
  nc: NatsConnection,
  data: { tenantId: string; learnerId: string; sku: string },
) {
  await publishEvent(nc, "tutor.addon.activated", data);
}

export async function publishTutorDeactivated(
  nc: NatsConnection,
  data: { tenantId: string; learnerId: string; sku: string },
) {
  await publishEvent(nc, "tutor.addon.deactivated", data);
}
