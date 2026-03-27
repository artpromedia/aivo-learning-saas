import type { FastifyInstance } from "fastify";
import type { PushSubscription } from "web-push";

export interface WebPushNotification {
  subscription: PushSubscription;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendWebPushNotification(app: FastifyInstance, notification: WebPushNotification): Promise<void> {
  try {
    await app.webPush.send(notification.subscription, {
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });
    app.log.info({ endpoint: notification.subscription.endpoint.substring(0, 40) }, "Web push sent");
  } catch (err) {
    app.log.error({ err }, "Web push send failed");
    throw err;
  }
}
