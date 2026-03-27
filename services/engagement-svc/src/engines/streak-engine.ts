import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { learnerXp } from "@aivo/db";
import { publishEvent } from "@aivo/events";

const STREAK_KEY_PREFIX = "streak:";
const STREAK_FREEZE_COST = 50;

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezeUsedThisWeek: boolean;
  freezeLastUsedDate: string | null;
}

export class StreakEngine {
  constructor(private readonly app: FastifyInstance) {}

  private key(learnerId: string): string {
    return `${STREAK_KEY_PREFIX}${learnerId}`;
  }

  async getStreak(learnerId: string): Promise<StreakState> {
    const raw = await this.app.redis.hgetall(this.key(learnerId));

    if (!raw || Object.keys(raw).length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        freezeUsedThisWeek: false,
        freezeLastUsedDate: null,
      };
    }

    return {
      currentStreak: parseInt(raw.currentStreak || "0", 10),
      longestStreak: parseInt(raw.longestStreak || "0", 10),
      lastActivityDate: raw.lastActivityDate || null,
      freezeUsedThisWeek: raw.freezeUsedThisWeek === "true",
      freezeLastUsedDate: raw.freezeLastUsedDate || null,
    };
  }

  async recordActivity(learnerId: string): Promise<{
    streakExtended: boolean;
    streakBroken: boolean;
    currentStreak: number;
  }> {
    const today = new Date().toISOString().split("T")[0];
    const state = await this.getStreak(learnerId);

    // Already recorded activity today
    if (state.lastActivityDate === today) {
      return { streakExtended: false, streakBroken: false, currentStreak: state.currentStreak };
    }

    const yesterday = this.getYesterday();
    let streakExtended = false;
    let streakBroken = false;
    let newStreak = state.currentStreak;

    if (state.lastActivityDate === yesterday) {
      // Consecutive day — extend streak
      newStreak += 1;
      streakExtended = true;
    } else if (state.lastActivityDate === null) {
      // First ever activity
      newStreak = 1;
      streakExtended = true;
    } else {
      // Missed day(s) — check for freeze
      const daysBetween = this.daysBetween(state.lastActivityDate, today);

      if (daysBetween === 2 && this.canUseFreezeRetroactively(state)) {
        // Freeze covers 1 missed day
        newStreak += 1;
        streakExtended = true;
      } else {
        // Streak broken
        streakBroken = state.currentStreak > 0;
        newStreak = 1;
      }
    }

    const newLongest = Math.max(state.longestStreak, newStreak);

    // Reset weekly freeze on Monday
    const freezeUsedThisWeek = this.isCurrentWeek(state.freezeLastUsedDate)
      ? state.freezeUsedThisWeek
      : false;

    await this.app.redis.hmset(this.key(learnerId), {
      currentStreak: newStreak.toString(),
      longestStreak: newLongest.toString(),
      lastActivityDate: today,
      freezeUsedThisWeek: freezeUsedThisWeek.toString(),
      freezeLastUsedDate: state.freezeLastUsedDate || "",
    });

    // Sync to database
    await this.syncToDb(learnerId, newStreak, newLongest, today);

    // Publish events
    if (streakExtended) {
      await publishEvent(this.app.nats, "engagement.streak.extended", {
        learnerId,
        currentStreak: newStreak,
      });
    }

    if (streakBroken) {
      await publishEvent(this.app.nats, "engagement.streak.broken", {
        learnerId,
        previousStreak: state.currentStreak,
      });
    }

    return { streakExtended, streakBroken, currentStreak: newStreak };
  }

  async useStreakFreeze(learnerId: string): Promise<{
    success: boolean;
    error?: string;
    coinsDeducted: number;
  }> {
    const state = await this.getStreak(learnerId);

    // Check if already used this week
    if (this.isCurrentWeek(state.freezeLastUsedDate) && state.freezeUsedThisWeek) {
      return { success: false, error: "Streak freeze already used this week", coinsDeducted: 0 };
    }

    // Check coin balance
    const [xpRecord] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    if (!xpRecord || xpRecord.virtualCurrency < STREAK_FREEZE_COST) {
      return { success: false, error: "Insufficient AivoCoins (need 50)", coinsDeducted: 0 };
    }

    // Deduct coins
    await this.app.db
      .update(learnerXp)
      .set({ virtualCurrency: xpRecord.virtualCurrency - STREAK_FREEZE_COST })
      .where(eq(learnerXp.id, xpRecord.id));

    const today = new Date().toISOString().split("T")[0];

    await this.app.redis.hmset(this.key(learnerId), {
      freezeUsedThisWeek: "true",
      freezeLastUsedDate: today,
    });

    return { success: true, coinsDeducted: STREAK_FREEZE_COST };
  }

  private canUseFreezeRetroactively(state: StreakState): boolean {
    if (state.freezeUsedThisWeek && this.isCurrentWeek(state.freezeLastUsedDate)) {
      return false;
    }
    return state.currentStreak > 0;
  }

  private getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  private daysBetween(dateA: string, dateB: string): number {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  }

  private isCurrentWeek(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return date >= weekStart;
  }

  private async syncToDb(
    learnerId: string,
    currentStreak: number,
    longestStreak: number,
    lastActivityDate: string,
  ): Promise<void> {
    const [existing] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    if (existing) {
      await this.app.db
        .update(learnerXp)
        .set({
          currentStreakDays: currentStreak,
          longestStreakDays: longestStreak,
          lastActivityDate,
          updatedAt: new Date(),
        })
        .where(eq(learnerXp.id, existing.id));
    }
  }
}
