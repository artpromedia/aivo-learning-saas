import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { notificationPreferences } from "@aivo/db";

export type NotificationChannel = "email" | "push" | "inApp";

export interface UserPreference {
  notificationType: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

export class PreferenceService {
  constructor(private readonly app: FastifyInstance) {}

  async isChannelEnabled(userId: string, notificationType: string, channel: NotificationChannel): Promise<boolean> {
    const [pref] = await this.app.db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.notificationType, notificationType),
        ),
      )
      .limit(1);

    // Default: all channels enabled
    if (!pref) return true;

    switch (channel) {
      case "email": return pref.emailEnabled;
      case "push": return pref.pushEnabled;
      case "inApp": return pref.inAppEnabled;
    }
  }

  async getPreferences(userId: string): Promise<UserPreference[]> {
    const prefs = await this.app.db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    return prefs.map((p) => ({
      notificationType: p.notificationType,
      emailEnabled: p.emailEnabled,
      pushEnabled: p.pushEnabled,
      inAppEnabled: p.inAppEnabled,
    }));
  }

  async updatePreference(
    userId: string,
    notificationType: string,
    updates: Partial<{ emailEnabled: boolean; pushEnabled: boolean; inAppEnabled: boolean }>,
  ): Promise<void> {
    const [existing] = await this.app.db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.notificationType, notificationType),
        ),
      )
      .limit(1);

    if (existing) {
      await this.app.db
        .update(notificationPreferences)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(notificationPreferences.id, existing.id));
    } else {
      await this.app.db.insert(notificationPreferences).values({
        userId,
        notificationType,
        emailEnabled: updates.emailEnabled ?? true,
        pushEnabled: updates.pushEnabled ?? true,
        inAppEnabled: updates.inAppEnabled ?? true,
      });
    }
  }

  async updateBulkPreferences(
    userId: string,
    preferences: Array<{
      notificationType: string;
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      inAppEnabled?: boolean;
    }>,
  ): Promise<void> {
    for (const pref of preferences) {
      await this.updatePreference(userId, pref.notificationType, {
        emailEnabled: pref.emailEnabled,
        pushEnabled: pref.pushEnabled,
        inAppEnabled: pref.inAppEnabled,
      });
    }
  }
}
