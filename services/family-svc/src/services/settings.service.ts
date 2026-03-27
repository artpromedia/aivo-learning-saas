import type { FastifyInstance } from "fastify";

const SETTINGS_PREFIX = "family:settings:";

export interface FamilySettings {
  userId: string;
  leaderboardOptOut: boolean;
  dailyReportEmail: boolean;
  weeklyDigestEmail: boolean;
  notificationsEnabled: boolean;
  privacyMode: "standard" | "restricted";
}

const DEFAULT_SETTINGS: Omit<FamilySettings, "userId"> = {
  leaderboardOptOut: false,
  dailyReportEmail: false,
  weeklyDigestEmail: true,
  notificationsEnabled: true,
  privacyMode: "standard",
};

export class SettingsService {
  constructor(private readonly app: FastifyInstance) {}

  async getSettings(userId: string): Promise<FamilySettings> {
    const raw = await this.app.redis.get(`${SETTINGS_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw) as FamilySettings;
    }
    return { userId, ...DEFAULT_SETTINGS };
  }

  async updateSettings(userId: string, updates: Partial<Omit<FamilySettings, "userId">>): Promise<FamilySettings> {
    const current = await this.getSettings(userId);
    const updated = { ...current, ...updates, userId };
    await this.app.redis.set(`${SETTINGS_PREFIX}${userId}`, JSON.stringify(updated));
    return updated;
  }

  async updatePrivacy(userId: string, updates: {
    leaderboardOptOut?: boolean;
    privacyMode?: "standard" | "restricted";
  }): Promise<FamilySettings> {
    return this.updateSettings(userId, updates);
  }
}
