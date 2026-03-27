import type { FastifyInstance } from "fastify";
import {
  SM2_CONFIG,
  scoreToQuality,
  calculateNewEasinessFactor,
  calculateNextInterval,
} from "../data/spaced-repetition-config.js";

export interface SpacedRepetitionItem {
  learnerId: string;
  subject: string;
  skill: string;
  easinessFactor: number;
  intervalDays: number;
  repetitionCount: number;
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  lastReviewDate: string | null;
}

const REDIS_PREFIX = "sr:";

function redisKey(learnerId: string, subject: string, skill: string): string {
  return `${REDIS_PREFIX}${learnerId}:${subject}:${skill}`;
}

function dueSetKey(learnerId: string): string {
  return `${REDIS_PREFIX}due:${learnerId}`;
}

export class SpacedRepetitionService {
  constructor(private readonly app: FastifyInstance) {}

  async getItem(learnerId: string, subject: string, skill: string): Promise<SpacedRepetitionItem | null> {
    const raw = await this.app.redis.get(redisKey(learnerId, subject, skill));
    if (!raw) return null;
    return JSON.parse(raw) as SpacedRepetitionItem;
  }

  async initializeItem(learnerId: string, subject: string, skill: string): Promise<SpacedRepetitionItem> {
    const today = new Date().toISOString().split("T")[0];
    const item: SpacedRepetitionItem = {
      learnerId,
      subject,
      skill,
      easinessFactor: SM2_CONFIG.defaultEasinessFactor,
      intervalDays: 0,
      repetitionCount: 0,
      nextReviewDate: today,
      lastReviewDate: null,
    };
    await this.saveItem(item);
    return item;
  }

  async processReview(
    learnerId: string,
    subject: string,
    skill: string,
    score: number,
  ): Promise<SpacedRepetitionItem> {
    let item = await this.getItem(learnerId, subject, skill);
    if (!item) {
      item = await this.initializeItem(learnerId, subject, skill);
    }

    const quality = scoreToQuality(score);
    const today = new Date().toISOString().split("T")[0];

    if (quality >= SM2_CONFIG.passingQuality) {
      // Correct response: increase interval
      const newInterval = calculateNextInterval(
        item.repetitionCount,
        item.intervalDays,
        item.easinessFactor,
      );
      item.repetitionCount += 1;
      item.intervalDays = newInterval;
    } else {
      // Incorrect response: reset
      item.repetitionCount = 0;
      item.intervalDays = SM2_CONFIG.firstInterval;
    }

    item.easinessFactor = calculateNewEasinessFactor(item.easinessFactor, quality);
    item.lastReviewDate = today;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + item.intervalDays);
    item.nextReviewDate = nextDate.toISOString().split("T")[0];

    await this.saveItem(item);
    return item;
  }

  async getDueItems(learnerId: string): Promise<SpacedRepetitionItem[]> {
    const today = new Date().toISOString().split("T")[0];
    const dueMembers = await this.app.redis.zrangebyscore(
      dueSetKey(learnerId),
      "-inf",
      today.replace(/-/g, ""),
    );

    const items: SpacedRepetitionItem[] = [];
    for (const memberKey of dueMembers) {
      const raw = await this.app.redis.get(memberKey);
      if (raw) {
        items.push(JSON.parse(raw) as SpacedRepetitionItem);
      }
    }
    return items;
  }

  async getAllItems(learnerId: string): Promise<SpacedRepetitionItem[]> {
    const pattern = `${REDIS_PREFIX}${learnerId}:*`;
    const keys: string[] = [];
    let cursor = "0";
    do {
      const [newCursor, batch] = await this.app.redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = newCursor;
      keys.push(...batch.filter((k) => !k.includes(":due:")));
    } while (cursor !== "0");

    const items: SpacedRepetitionItem[] = [];
    for (const key of keys) {
      const raw = await this.app.redis.get(key);
      if (raw) {
        items.push(JSON.parse(raw) as SpacedRepetitionItem);
      }
    }
    return items;
  }

  private async saveItem(item: SpacedRepetitionItem): Promise<void> {
    const key = redisKey(item.learnerId, item.subject, item.skill);
    await this.app.redis.set(key, JSON.stringify(item));

    // Update sorted set for due-date lookups
    const scoreDate = parseInt(item.nextReviewDate.replace(/-/g, ""), 10);
    await this.app.redis.zadd(dueSetKey(item.learnerId), scoreDate, key);
  }
}
