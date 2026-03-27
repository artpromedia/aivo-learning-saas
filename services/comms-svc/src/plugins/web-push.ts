import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import webPush from "web-push";
import { getConfig } from "../config.js";

export interface WebPushClient {
  send(subscription: webPush.PushSubscription, payload: { title: string; body: string; data?: Record<string, unknown> }): Promise<void>;
}

declare module "fastify" {
  interface FastifyInstance {
    webPush: WebPushClient;
  }
}

class VapidWebPushClient implements WebPushClient {
  constructor(publicKey: string, privateKey: string, contactEmail: string) {
    webPush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
  }

  async send(
    subscription: webPush.PushSubscription,
    payload: { title: string; body: string; data?: Record<string, unknown> },
  ): Promise<void> {
    await webPush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 86400,
      urgency: "high",
    });
  }
}

class ConsoleWebPushClient implements WebPushClient {
  async send(
    subscription: webPush.PushSubscription,
    payload: { title: string; body: string; data?: Record<string, unknown> },
  ): Promise<void> {
    console.log("──── DEV WEB PUSH ────");
    console.log(`Endpoint: ${subscription.endpoint.substring(0, 40)}...`);
    console.log(`Title: ${payload.title}`);
    console.log(`Body: ${payload.body}`);
    console.log("──────────────────────");
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();

  const client: WebPushClient = config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY
    ? new VapidWebPushClient(config.VAPID_PUBLIC_KEY, config.VAPID_PRIVATE_KEY, config.VAPID_CONTACT_EMAIL)
    : new ConsoleWebPushClient();

  fastify.decorate("webPush", client);
});
