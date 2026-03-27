import type { FastifyInstance } from "fastify";
import { eq, desc, and, sql } from "drizzle-orm";
import { notifications } from "@aivo/db";
import { broadcastNotification } from "../realtime/broadcaster.js";
import { PreferenceService } from "./preference.service.js";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
}

export class NotificationService {
  private preferenceService: PreferenceService;

  constructor(private readonly app: FastifyInstance) {
    this.preferenceService = new PreferenceService(app);
  }

  async create(input: CreateNotificationInput): Promise<{ id: string }> {
    // Check preferences
    const allowed = await this.preferenceService.isChannelEnabled(
      input.userId,
      input.type,
      "inApp",
    );
    if (!allowed) {
      this.app.log.info({ type: input.type, userId: input.userId }, "In-app notification skipped — user opted out");
      return { id: "" };
    }

    const [notification] = await this.app.db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl,
      })
      .returning({ id: notifications.id });

    // Broadcast to connected sockets
    broadcastNotification(this.app, input.userId, {
      id: notification.id,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
    });

    return { id: notification.id };
  }

  async listForUser(userId: string, page: number = 1, limit: number = 20): Promise<{
    items: Array<{
      id: string;
      type: string;
      title: string;
      body: string;
      actionUrl: string | null;
      read: boolean;
      createdAt: Date;
    }>;
    total: number;
    unreadCount: number;
  }> {
    const offset = (page - 1) * limit;

    const items = await this.app.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.read, desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.app.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    const [unreadResult] = await this.app.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    return {
      items,
      total: countResult.count,
      unreadCount: unreadResult.count,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.app.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.app.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await this.app.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    return result.count;
  }
}
