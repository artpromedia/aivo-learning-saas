import type { FastifyInstance } from "fastify";

export interface DailyChallenge {
  type: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  completed: boolean;
}

const DAILY_PREFIX = "daily:";

export class DailyChallengeService {
  constructor(private readonly app: FastifyInstance) {}

  async getDailyChallenges(learnerId: string): Promise<DailyChallenge[]> {
    const today = new Date().toISOString().split("T")[0];
    const completedKey = `${DAILY_PREFIX}${learnerId}:${today}`;
    const completedRaw = await this.app.redis.smembers(completedKey);
    const completedSet = new Set(completedRaw);

    const challenges: DailyChallenge[] = [
      {
        type: "sel_checkin",
        title: "Daily Check-In",
        description: "Tell us how you're feeling today",
        xpReward: 5,
        coinReward: 2,
        completed: completedSet.has("sel_checkin"),
      },
      {
        type: "complete_lesson",
        title: "Complete a Lesson",
        description: "Finish any lesson to earn bonus XP",
        xpReward: 10,
        coinReward: 5,
        completed: completedSet.has("complete_lesson"),
      },
      {
        type: "quiz_attempt",
        title: "Take a Quiz",
        description: "Test your knowledge with a quiz",
        xpReward: 15,
        coinReward: 8,
        completed: completedSet.has("quiz_attempt"),
      },
      {
        type: "break_activity",
        title: "Take a Break",
        description: "Complete a mindfulness or stretch break",
        xpReward: 5,
        coinReward: 2,
        completed: completedSet.has("break_activity"),
      },
      {
        type: "challenge_play",
        title: "Challenge a Friend",
        description: "Play a multiplayer quiz challenge",
        xpReward: 20,
        coinReward: 10,
        completed: completedSet.has("challenge_play"),
      },
    ];

    return challenges;
  }

  async markCompleted(learnerId: string, challengeType: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const key = `${DAILY_PREFIX}${learnerId}:${today}`;
    await this.app.redis.sadd(key, challengeType);
    await this.app.redis.expire(key, 86400 * 2); // 2 day TTL
  }
}
