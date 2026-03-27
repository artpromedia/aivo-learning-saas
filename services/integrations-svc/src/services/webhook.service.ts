import type { FastifyInstance } from "fastify";
import { webhookEndpoints, webhookDeliveries } from "@aivo/db";
import { eq, desc, and, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { DeliveryEngine } from "../webhooks/delivery-engine.js";
import { PayloadBuilder } from "../webhooks/payload-builder.js";

const VALID_EVENT_TYPES = [
  "learner.session.completed",
  "learner.mastery.updated",
  "brain.recommendation.created",
  "iep.goal.met",
];

export interface CreateWebhookInput {
  url: string;
  eventTypes: string[];
  description?: string;
}

export interface UpdateWebhookInput {
  url?: string;
  eventTypes?: string[];
  description?: string;
  enabled?: boolean;
}

export class WebhookService {
  private deliveryEngine: DeliveryEngine;
  private payloadBuilder: PayloadBuilder;

  constructor(private readonly app: FastifyInstance) {
    this.deliveryEngine = new DeliveryEngine(app);
    this.payloadBuilder = new PayloadBuilder();
  }

  async list(tenantId: string) {
    return this.app.db
      .select()
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.tenantId, tenantId));
  }

  async create(tenantId: string, input: CreateWebhookInput) {
    for (const eventType of input.eventTypes) {
      if (!VALID_EVENT_TYPES.includes(eventType)) {
        throw Object.assign(new Error(`Invalid event type: ${eventType}`), { statusCode: 400 });
      }
    }

    const secret = `whsec_${nanoid(32)}`;

    const [endpoint] = await this.app.db
      .insert(webhookEndpoints)
      .values({
        tenantId,
        url: input.url,
        secret,
        eventTypes: input.eventTypes,
        description: input.description,
        enabled: true,
      })
      .returning();

    return { ...endpoint, secret };
  }

  async update(webhookId: string, tenantId: string, input: UpdateWebhookInput) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (input.url !== undefined) updateData.url = input.url;
    if (input.eventTypes !== undefined) updateData.eventTypes = input.eventTypes;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;

    const [endpoint] = await this.app.db
      .update(webhookEndpoints)
      .set(updateData)
      .where(and(eq(webhookEndpoints.id, webhookId), eq(webhookEndpoints.tenantId, tenantId)))
      .returning();

    if (!endpoint) throw Object.assign(new Error("Webhook not found"), { statusCode: 404 });
    return endpoint;
  }

  async delete(webhookId: string, tenantId: string) {
    const [endpoint] = await this.app.db
      .select()
      .from(webhookEndpoints)
      .where(and(eq(webhookEndpoints.id, webhookId), eq(webhookEndpoints.tenantId, tenantId)))
      .limit(1);

    if (!endpoint) throw Object.assign(new Error("Webhook not found"), { statusCode: 404 });

    await this.app.db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, webhookId));
    return { deleted: true };
  }

  async getDeliveries(webhookId: string, tenantId: string, page = 1, limit = 25) {
    const [endpoint] = await this.app.db
      .select()
      .from(webhookEndpoints)
      .where(and(eq(webhookEndpoints.id, webhookId), eq(webhookEndpoints.tenantId, tenantId)))
      .limit(1);

    if (!endpoint) throw Object.assign(new Error("Webhook not found"), { statusCode: 404 });

    const offset = (page - 1) * limit;

    const [items, totalResult] = await Promise.all([
      this.app.db
        .select()
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.webhookEndpointId, webhookId))
        .orderBy(desc(webhookDeliveries.createdAt))
        .limit(limit)
        .offset(offset),
      this.app.db
        .select({ total: count() })
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.webhookEndpointId, webhookId)),
    ]);

    return {
      items,
      pagination: { page, limit, total: totalResult[0]?.total ?? 0 },
    };
  }

  async sendTestPayload(webhookId: string, tenantId: string) {
    const [endpoint] = await this.app.db
      .select()
      .from(webhookEndpoints)
      .where(and(eq(webhookEndpoints.id, webhookId), eq(webhookEndpoints.tenantId, tenantId)))
      .limit(1);

    if (!endpoint) throw Object.assign(new Error("Webhook not found"), { statusCode: 404 });

    const payload = this.payloadBuilder.build("test.ping", {
      message: "This is a test webhook delivery from AIVO",
      timestamp: new Date().toISOString(),
    });

    const deliveryId = await this.deliveryEngine.deliver(webhookId, payload);
    return { deliveryId, payload };
  }

  async dispatchEvent(eventType: string, data: Record<string, unknown>, tenantId?: string) {
    const endpoints = tenantId
      ? await this.app.db
          .select()
          .from(webhookEndpoints)
          .where(and(eq(webhookEndpoints.tenantId, tenantId), eq(webhookEndpoints.enabled, true)))
      : await this.app.db
          .select()
          .from(webhookEndpoints)
          .where(eq(webhookEndpoints.enabled, true));

    const payload = this.payloadBuilder.build(eventType, data);

    for (const endpoint of endpoints) {
      const eventTypes = endpoint.eventTypes as string[];
      if (eventTypes.includes(eventType)) {
        await this.deliveryEngine.deliver(endpoint.id, payload).catch((err) => {
          this.app.log.error({ err, endpointId: endpoint.id }, "Webhook dispatch failed");
        });
      }
    }
  }
}
