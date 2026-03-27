import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";
import { XpEngine } from "../engines/xp-engine.js";
import { SEL_EMOTIONS, BREAK_ACTIVITIES, type Emotion, type BreakActivityType } from "../data/sel-activities.js";

const SEL_HISTORY_PREFIX = "sel:history:";
const SEL_DAILY_PREFIX = "sel:daily:";

export interface SelCheckin {
  emotion: Emotion;
  note: string | null;
  timestamp: string;
}

export class SelService {
  private readonly xpEngine: XpEngine;

  constructor(private readonly app: FastifyInstance) {
    this.xpEngine = new XpEngine(app);
  }

  getEmotionOptions() {
    return SEL_EMOTIONS;
  }

  getBreakActivities() {
    return BREAK_ACTIVITIES;
  }

  async submitCheckin(
    learnerId: string,
    emotion: Emotion,
    note: string | null,
  ): Promise<{ xpAwarded: number; followUpPrompt: string }> {
    const today = new Date().toISOString().split("T")[0];
    const checkin: SelCheckin = {
      emotion,
      note,
      timestamp: new Date().toISOString(),
    };

    // Store in Redis list for history
    await this.app.redis.lpush(
      `${SEL_HISTORY_PREFIX}${learnerId}`,
      JSON.stringify(checkin),
    );
    // Trim to last 365 entries
    await this.app.redis.ltrim(`${SEL_HISTORY_PREFIX}${learnerId}`, 0, 364);

    // Mark daily checkin done
    await this.app.redis.set(`${SEL_DAILY_PREFIX}${learnerId}:${today}`, "1", "EX", 86400);

    // Award XP
    const result = await this.xpEngine.awardXp(
      learnerId,
      "sel_checkin",
      "sel.checkin.completed",
      5,
      2,
    );

    const selPrompt = SEL_EMOTIONS.find((e) => e.emotion === emotion);

    return {
      xpAwarded: result.xpAwarded,
      followUpPrompt: selPrompt?.followUpPrompt ?? "Thanks for checking in!",
    };
  }

  async getHistory(learnerId: string, limit = 30): Promise<SelCheckin[]> {
    const raw = await this.app.redis.lrange(
      `${SEL_HISTORY_PREFIX}${learnerId}`,
      0,
      limit - 1,
    );
    return raw.map((r) => JSON.parse(r) as SelCheckin);
  }

  async startBreak(
    learnerId: string,
    activityType: BreakActivityType,
  ): Promise<{
    activity: typeof BREAK_ACTIVITIES[0];
    xpAwarded: number;
  }> {
    const activity = BREAK_ACTIVITIES.find((a) => a.type === activityType);
    if (!activity) {
      throw Object.assign(new Error("Break activity not found"), { statusCode: 404 });
    }

    // Award XP for break
    const result = await this.xpEngine.awardXp(
      learnerId,
      "break_completed",
      "break.completed",
      activity.xpReward,
      2,
    );

    await publishEvent(this.app.nats, "break.completed", {
      learnerId,
    });

    return { activity, xpAwarded: result.xpAwarded };
  }

  async hasCheckedInToday(learnerId: string): Promise<boolean> {
    const today = new Date().toISOString().split("T")[0];
    const exists = await this.app.redis.get(`${SEL_DAILY_PREFIX}${learnerId}:${today}`);
    return exists !== null;
  }
}
