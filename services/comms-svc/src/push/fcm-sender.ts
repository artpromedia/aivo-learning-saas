import type { FastifyInstance } from "fastify";

export interface FcmNotification {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export async function sendFcmNotification(app: FastifyInstance, notification: FcmNotification): Promise<void> {
  try {
    await app.fcm.send({
      token: notification.token,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      imageUrl: notification.imageUrl,
    });
    app.log.info({ token: notification.token.substring(0, 20) }, "FCM notification sent");
  } catch (err) {
    app.log.error({ err, token: notification.token.substring(0, 20) }, "FCM send failed");
    throw err;
  }
}
