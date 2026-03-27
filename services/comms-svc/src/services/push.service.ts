import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { pushTokens } from "@aivo/db";
import { sendFcmNotification } from "../push/fcm-sender.js";
import { sendWebPushNotification } from "../push/web-push-sender.js";
import { buildPushPayload, type PushNotificationType } from "../push/notification-builder.js";
import { PreferenceService } from "./preference.service.js";
import type { PushSubscription } from "web-push";

export class PushService {
  private preferenceService: PreferenceService;

  constructor(private readonly app: FastifyInstance) {
    this.preferenceService = new PreferenceService(app);
  }

  async registerToken(userId: string, type: "fcm" | "web-push", token: string, subscription?: unknown, deviceName?: string): Promise<void> {
    // Upsert: if token already exists, update
    const existing = await this.app.db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.token, token))
      .limit(1);

    if (existing.length > 0) {
      await this.app.db
        .update(pushTokens)
        .set({ userId, type, subscription: subscription ?? null, deviceName, updatedAt: new Date() })
        .where(eq(pushTokens.token, token));
    } else {
      await this.app.db.insert(pushTokens).values({
        userId,
        type,
        token,
        subscription: subscription ?? null,
        deviceName,
      });
    }

    this.app.log.info({ userId, type }, "Push token registered");
  }

  async unregisterToken(token: string): Promise<void> {
    await this.app.db.delete(pushTokens).where(eq(pushTokens.token, token));
    this.app.log.info("Push token unregistered");
  }

  async sendToUser(
    userId: string,
    notificationType: PushNotificationType,
    data: Record<string, string>,
    templateSlug?: string,
  ): Promise<void> {
    // Check preferences
    const allowed = await this.preferenceService.isChannelEnabled(
      userId,
      templateSlug ?? notificationType,
      "push",
    );
    if (!allowed) {
      this.app.log.info({ userId, notificationType }, "Push skipped — user opted out");
      return;
    }

    const tokens = await this.app.db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, userId));

    if (tokens.length === 0) {
      this.app.log.debug({ userId }, "No push tokens registered for user");
      return;
    }

    const payload = buildPushPayload(notificationType, data);

    const sendPromises = tokens.map(async (t) => {
      try {
        if (t.type === "fcm") {
          await sendFcmNotification(this.app, {
            token: t.token,
            title: payload.title,
            body: payload.body,
            data: payload.data,
          });
        } else if (t.type === "web-push" && t.subscription) {
          await sendWebPushNotification(this.app, {
            subscription: t.subscription as PushSubscription,
            title: payload.title,
            body: payload.body,
            data: payload.data,
          });
        }
      } catch (err) {
        this.app.log.error({ err, tokenId: t.id }, "Push send failed — removing stale token");
        await this.app.db.delete(pushTokens).where(eq(pushTokens.id, t.id));
      }
    });

    await Promise.allSettled(sendPromises);
  }
}
