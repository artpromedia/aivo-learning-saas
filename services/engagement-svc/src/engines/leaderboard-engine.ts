import type { FastifyInstance } from "fastify";

const GLOBAL_WEEKLY_KEY = "leaderboard:global:weekly";
const CLASSROOM_WEEKLY_PREFIX = "leaderboard:classroom:";
const FRIENDS_PREFIX = "leaderboard:friends:";

export interface LeaderboardEntry {
  learnerId: string;
  displayName: string;
  totalXp: number;
  level: number;
  rank: number;
  badgeCount: number;
}

export class LeaderboardEngine {
  constructor(private readonly app: FastifyInstance) {}

  async addXpToLeaderboards(
    learnerId: string,
    xpAmount: number,
    classroomIds: string[] = [],
  ): Promise<void> {
    // Global weekly
    await this.app.redis.zincrby(GLOBAL_WEEKLY_KEY, xpAmount, learnerId);

    // Classroom weeklies
    for (const classId of classroomIds) {
      await this.app.redis.zincrby(
        `${CLASSROOM_WEEKLY_PREFIX}${classId}:weekly`,
        xpAmount,
        learnerId,
      );
    }
  }

  async getGlobalLeaderboard(limit = 20, offset = 0): Promise<LeaderboardEntry[]> {
    return this.getLeaderboard(GLOBAL_WEEKLY_KEY, limit, offset);
  }

  async getClassroomLeaderboard(classroomId: string, limit = 20, offset = 0): Promise<LeaderboardEntry[]> {
    return this.getLeaderboard(`${CLASSROOM_WEEKLY_PREFIX}${classroomId}:weekly`, limit, offset);
  }

  async getFriendsLeaderboard(learnerId: string, limit = 20): Promise<LeaderboardEntry[]> {
    const friendIds = await this.app.redis.smembers(`${FRIENDS_PREFIX}${learnerId}`);
    if (friendIds.length === 0) return [];

    // Get scores for all friends from global leaderboard
    const entries: LeaderboardEntry[] = [];
    for (const friendId of [...friendIds, learnerId]) {
      const score = await this.app.redis.zscore(GLOBAL_WEEKLY_KEY, friendId);
      if (score !== null) {
        entries.push({
          learnerId: friendId,
          displayName: "",
          totalXp: parseFloat(score),
          level: 0,
          rank: 0,
          badgeCount: 0,
        });
      }
    }

    // Sort and rank
    entries.sort((a, b) => b.totalXp - a.totalXp);
    entries.forEach((e, idx) => { e.rank = idx + 1; });

    return entries.slice(0, limit);
  }

  async getLearnerRank(learnerId: string): Promise<number | null> {
    const rank = await this.app.redis.zrevrank(GLOBAL_WEEKLY_KEY, learnerId);
    return rank !== null ? rank + 1 : null;
  }

  async resetWeeklyLeaderboards(): Promise<void> {
    // Get all weekly leaderboard keys
    const keys: string[] = [GLOBAL_WEEKLY_KEY];

    let cursor = "0";
    do {
      const [newCursor, batch] = await this.app.redis.scan(
        cursor, "MATCH", `${CLASSROOM_WEEKLY_PREFIX}*:weekly`, "COUNT", 100,
      );
      cursor = newCursor;
      keys.push(...batch);
    } while (cursor !== "0");

    if (keys.length > 0) {
      await this.app.redis.del(...keys);
    }
  }

  private async getLeaderboard(key: string, limit: number, offset: number): Promise<LeaderboardEntry[]> {
    const results = await this.app.redis.zrevrange(
      key,
      offset,
      offset + limit - 1,
      "WITHSCORES",
    );

    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        learnerId: results[i],
        displayName: "",
        totalXp: parseFloat(results[i + 1]),
        level: 0,
        rank: offset + Math.floor(i / 2) + 1,
        badgeCount: 0,
      });
    }

    return entries;
  }
}
