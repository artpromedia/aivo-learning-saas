import type { FastifyInstance } from "fastify";
import { webhookDeliveries, webhookEndpoints } from "@aivo/db";
import { eq, and, lte } from "drizzle-orm";
import { signPayload } from "./signature.js";
import type { WebhookPayload } from "./payload-builder.js";

const RETRY_DELAYS = [60, 300, 1800, 7200, 43200]; // 1min, 5min, 30min, 2h, 12h

export class DeliveryEngine {
  constructor(private readonly app: FastifyInstance) {}

  async deliver(endpointId: string, payload: WebhookPayload): Promise<string> {
    const [endpoint] = await this.app.db
      .select()
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.id, endpointId))
      .limit(1);

    if (!endpoint || !endpoint.enabled) {
      throw new Error("Webhook endpoint not found or disabled");
    }

    const [delivery] = await this.app.db
      .insert(webhookDeliveries)
      .values({
        webhookEndpointId: endpointId,
        eventType: payload.eventType,
        payload,
        status: "PENDING",
        attempts: 0,
        maxAttempts: 5,
      })
      .returning();

    await this.attemptDelivery(delivery.id, endpoint.url, endpoint.secret, payload);
    return delivery.id;
  }

  async attemptDelivery(
    deliveryId: string,
    url: string,
    secret: string,
    payload: WebhookPayload,
  ): Promise<boolean> {
    const payloadStr = JSON.stringify(payload);
    const signature = signPayload(payloadStr, secret);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": `sha256=${signature}`,
          "X-Webhook-Event": payload.eventType,
          "X-Webhook-Id": payload.id,
        },
        body: payloadStr,
        signal: AbortSignal.timeout(30000),
      });

      const responseBody = await response.text().catch(() => "");

      if (response.ok) {
        await this.app.db
          .update(webhookDeliveries)
          .set({
            status: "DELIVERED",
            httpStatus: response.status,
            responseBody: responseBody.slice(0, 4096),
            attempts: 1,
            deliveredAt: new Date(),
          })
          .where(eq(webhookDeliveries.id, deliveryId));
        return true;
      }

      await this.scheduleRetry(deliveryId, response.status, responseBody);
      return false;
    } catch (err) {
      await this.scheduleRetry(deliveryId, 0, (err as Error).message);
      return false;
    }
  }

  async retryFailedDeliveries(): Promise<number> {
    const now = new Date();
    const pendingRetries = await this.app.db
      .select()
      .from(webhookDeliveries)
      .where(
        and(
          eq(webhookDeliveries.status, "RETRYING"),
          lte(webhookDeliveries.nextRetryAt, now),
        ),
      );

    let retried = 0;
    for (const delivery of pendingRetries) {
      const [endpoint] = await this.app.db
        .select()
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.id, delivery.webhookEndpointId))
        .limit(1);

      if (!endpoint || !endpoint.enabled) continue;

      const success = await this.attemptDelivery(
        delivery.id,
        endpoint.url,
        endpoint.secret,
        delivery.payload as WebhookPayload,
      );

      if (success) retried++;
    }

    return retried;
  }

  private async scheduleRetry(deliveryId: string, httpStatus: number, responseBody: string) {
    const [delivery] = await this.app.db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.id, deliveryId))
      .limit(1);

    if (!delivery) return;

    const attempts = delivery.attempts + 1;

    if (attempts >= delivery.maxAttempts) {
      await this.app.db
        .update(webhookDeliveries)
        .set({
          status: "FAILED",
          httpStatus,
          responseBody: responseBody.slice(0, 4096),
          attempts,
        })
        .where(eq(webhookDeliveries.id, deliveryId));
      return;
    }

    const delaySeconds = RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)];
    const nextRetry = new Date(Date.now() + delaySeconds * 1000);

    await this.app.db
      .update(webhookDeliveries)
      .set({
        status: "RETRYING",
        httpStatus,
        responseBody: responseBody.slice(0, 4096),
        attempts,
        nextRetryAt: nextRetry,
      })
      .where(eq(webhookDeliveries.id, deliveryId));
  }
}
