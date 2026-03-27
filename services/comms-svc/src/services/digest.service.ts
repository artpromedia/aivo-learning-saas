import type { FastifyInstance } from "fastify";
import { eq, and, gte, sql } from "drizzle-orm";
import { learners, users, learnerXp, xpEvents } from "@aivo/db";
import type { WeeklyProgressDigestData } from "../email/templates/weekly-progress-digest.js";
import { getConfig } from "../config.js";

export interface DigestLearnerData {
  learnerId: string;
  learnerName: string;
  parentId: string;
  parentEmail: string;
  parentName: string;
}

export class DigestService {
  constructor(private readonly app: FastifyInstance) {}

  async getLearnersForDigest(): Promise<DigestLearnerData[]> {
    const results = await this.app.db
      .select({
        learnerId: learners.id,
        learnerName: learners.name,
        parentId: learners.parentId,
        parentEmail: users.email,
        parentName: users.name,
      })
      .from(learners)
      .innerJoin(users, eq(learners.parentId, users.id))
      .where(eq(learners.status, "ACTIVE"));

    return results;
  }

  async aggregateWeeklyData(learnerId: string): Promise<{
    xpEarned: number;
    lessonsCompleted: number;
    streakDays: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // XP earned this week
    const [xpResult] = await this.app.db
      .select({ total: sql<number>`coalesce(sum(${xpEvents.xpAmount}), 0)::int` })
      .from(xpEvents)
      .where(
        and(
          eq(xpEvents.learnerId, learnerId),
          gte(xpEvents.createdAt, oneWeekAgo),
        ),
      );

    // Lessons completed (from xp events with lesson/quiz activity)
    const [lessonResult] = await this.app.db
      .select({ count: sql<number>`count(*)::int` })
      .from(xpEvents)
      .where(
        and(
          eq(xpEvents.learnerId, learnerId),
          gte(xpEvents.createdAt, oneWeekAgo),
          sql`${xpEvents.activity} IN ('lesson_completed', 'quiz_completed')`,
        ),
      );

    // Current streak
    const [streakResult] = await this.app.db
      .select({ currentStreakDays: learnerXp.currentStreakDays })
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    return {
      xpEarned: xpResult.total,
      lessonsCompleted: lessonResult.count,
      streakDays: streakResult?.currentStreakDays ?? 0,
    };
  }

  buildDigestData(
    learner: DigestLearnerData,
    weeklyData: { xpEarned: number; lessonsCompleted: number; streakDays: number },
  ): WeeklyProgressDigestData {
    const config = getConfig();
    let weekSummary: string;

    if (weeklyData.lessonsCompleted === 0) {
      weekSummary = `${learner.learnerName} didn't have any learning sessions this week. A quick session today can kickstart a new streak!`;
    } else if (weeklyData.lessonsCompleted >= 10) {
      weekSummary = `Incredible week! ${learner.learnerName} completed ${weeklyData.lessonsCompleted} lessons and earned ${weeklyData.xpEarned} XP. Keep up the amazing work!`;
    } else {
      weekSummary = `${learner.learnerName} had a productive week with ${weeklyData.lessonsCompleted} lessons completed and ${weeklyData.xpEarned} XP earned.`;
    }

    return {
      userName: learner.parentName,
      learnerName: learner.learnerName,
      weekSummary,
      xpEarned: weeklyData.xpEarned,
      lessonsCompleted: weeklyData.lessonsCompleted,
      streakDays: weeklyData.streakDays,
      masteryChanges: [],
      recommendations: [],
      appUrl: config.APP_URL,
    };
  }
}
