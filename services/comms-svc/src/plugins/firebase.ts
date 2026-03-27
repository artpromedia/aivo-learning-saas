import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface FcmClient {
  send(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }): Promise<void>;
}

declare module "fastify" {
  interface FastifyInstance {
    fcm: FcmClient;
  }
}

class FirebaseFcmClient implements FcmClient {
  private app: import("firebase-admin").app.App;

  constructor(projectId: string, clientEmail: string, privateKey: string) {
    // Dynamic import to avoid loading firebase-admin when not configured
    const admin = require("firebase-admin") as typeof import("firebase-admin");
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  async send(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }): Promise<void> {
    const messaging = this.app.messaging();
    await messaging.send({
      token: params.token,
      notification: {
        title: params.title,
        body: params.body,
        imageUrl: params.imageUrl,
      },
      data: params.data,
      android: {
        priority: "high",
        notification: {
          channelId: "aivo_notifications",
          priority: "high",
        },
      },
      apns: {
        payload: {
          aps: {
            alert: { title: params.title, body: params.body },
            sound: "default",
            badge: 1,
          },
        },
      },
    });
  }
}

class ConsoleFcmClient implements FcmClient {
  async send(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    console.log("──── DEV FCM PUSH ────");
    console.log(`Token: ${params.token.substring(0, 20)}...`);
    console.log(`Title: ${params.title}`);
    console.log(`Body: ${params.body}`);
    console.log(`Data: ${JSON.stringify(params.data ?? {})}`);
    console.log("──────────────────────");
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();

  const client: FcmClient = config.FIREBASE_PROJECT_ID && config.FIREBASE_PRIVATE_KEY
    ? new FirebaseFcmClient(config.FIREBASE_PROJECT_ID, config.FIREBASE_CLIENT_EMAIL, config.FIREBASE_PRIVATE_KEY)
    : new ConsoleFcmClient();

  fastify.decorate("fcm", client);
});
