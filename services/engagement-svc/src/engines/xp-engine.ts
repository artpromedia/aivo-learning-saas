import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { learnerXp, xpEvents } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { XP_AWARDS } from "../data/xp-awards.js";
import { calculateLevel, levelProgress } from "../data/level-thresholds.js";

export interface XpAwardResult {
  xpAwarded: number;
  coinsAwarded: number;
  totalXp: number;
  newLevel: number;
  previousLevel: number;
  leveledUp: boolean;
}

export class XpEngine {
  constructor(private readonly app: FastifyInstance) {}

  async awardXp(
    learnerId: string,
    activity: string,
    triggerEvent: string,
    xpAmount: number,
    coinsAmount: number,
  ): Promise<XpAwardResult> {
    // Get or create learner XP record
    let [xpRecord] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    if (!xpRecord) {
      [xpRecord] = await this.app.db
        .insert(learnerXp)
        .values({ learnerId, totalXp: 0, level: 1, virtualCurrency: 0 })
        .returning();
    }

    const previousLevel = xpRecord.level;
    const newTotalXp = xpRecord.totalXp + xpAmount;
    const newCoins = xpRecord.virtualCurrency + coinsAmount;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > previousLevel;

    // Update XP record
    await this.app.db
      .update(learnerXp)
      .set({
        totalXp: newTotalXp,
        level: newLevel,
        virtualCurrency: newCoins,
        updatedAt: new Date(),
      })
      .where(eq(learnerXp.id, xpRecord.id));

    // Log XP event
    await this.app.db
      .insert(xpEvents)
      .values({
        learnerId,
        activity,
        xpAmount,
        triggerEvent,
        metadata: { coinsAwarded: coinsAmount },
      });

    // Publish level up event
    if (leveledUp) {
      await publishEvent(this.app.nats, "engagement.level.up", {
        learnerId,
        newLevel,
        totalXp: newTotalXp,
      });
    }

    return {
      xpAwarded: xpAmount,
      coinsAwarded: coinsAmount,
      totalXp: newTotalXp,
      newLevel,
      previousLevel,
      leveledUp,
    };
  }

  async processEvent(
    eventName: string,
    learnerId: string,
    metadata?: Record<string, unknown>,
  ): Promise<XpAwardResult | null> {
    const rule = XP_AWARDS[eventName];
    if (!rule) return null;

    let xp = rule.xp;
    let coins = rule.coins;

    // Handle dynamic XP calculations
    if (rule.dynamic) {
      if (eventName === "engagement.streak.extended" && metadata?.currentStreak) {
        const streakXp = Math.min(50, 5 * (metadata.currentStreak as number));
        xp = streakXp;
      }
      if (eventName === "homework.session.completed" && metadata?.completionQuality !== undefined) {
        const quality = metadata.completionQuality as number;
        xp = Math.round(quality * 30);
        coins = Math.round(quality * 15);
      }
      if (eventName === "engagement.challenge.completed" && metadata?.won !== undefined) {
        xp = (metadata.won as boolean) ? 30 : 15;
        coins = (metadata.won as boolean) ? 15 : 5;
      }
      if (eventName === "quest.chapter.completed" && metadata?.xpAmount) {
        xp = metadata.xpAmount as number;
        coins = Math.round((metadata.xpAmount as number) / 2);
      }
    }

    return this.awardXp(learnerId, eventName, eventName, xp, coins);
  }

  async getXpSummary(learnerId: string) {
    const [xpRecord] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    if (!xpRecord) {
      return {
        totalXp: 0,
        level: 1,
        virtualCurrency: 0,
        currentStreakDays: 0,
        longestStreakDays: 0,
        ...levelProgress(0),
      };
    }

    return {
      totalXp: xpRecord.totalXp,
      level: xpRecord.level,
      virtualCurrency: xpRecord.virtualCurrency,
      currentStreakDays: xpRecord.currentStreakDays,
      longestStreakDays: xpRecord.longestStreakDays,
      ...levelProgress(xpRecord.totalXp),
    };
  }

  async getXpHistory(learnerId: string, limit = 50, offset = 0) {
    const { desc } = await import("drizzle-orm");
    const events = await this.app.db
      .select()
      .from(xpEvents)
      .where(eq(xpEvents.learnerId, learnerId))
      .orderBy(desc(xpEvents.createdAt))
      .limit(limit)
      .offset(offset);

    return events.map((e) => ({
      id: e.id,
      activity: e.activity,
      xpAmount: e.xpAmount,
      triggerEvent: e.triggerEvent,
      metadata: e.metadata,
      createdAt: e.createdAt,
    }));
  }
}
