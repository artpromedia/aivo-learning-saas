import type { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { learners, recommendations, iepGoals, learningSessions, learnerXp } from "@aivo/db";

const CACHE_TTL_SECONDS = 300; // 5 minutes

export class DashboardService {
  constructor(private readonly app: FastifyInstance) {}

  async getOverview(learnerId: string) {
    const cacheKey = `dashboard:${learnerId}`;
    const cached = await this.app.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Learner info
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    if (!learner) {
      throw Object.assign(new Error("Learner not found"), { statusCode: 404 });
    }

    // Brain context
    let brainData: Record<string, unknown> = { version: "unknown", lastUpdated: null };
    let masteryData: Record<string, number> = {};
    let activeTutors: string[] = [];
    try {
      const context = await this.app.brainClient.getContext(learnerId);
      brainData = { version: context.mainBrainVersion, lastUpdated: context.lastUpdated };
      masteryData = this.summarizeMastery(context.masteryLevels);
      activeTutors = context.activeTutors.map((t) => t.subject);
    } catch {
      // Brain service may not be available
    }

    // Pending recommendations count
    const pendingRecs = await this.app.db
      .select()
      .from(recommendations)
      .where(
        and(
          eq(recommendations.learnerId, learnerId),
          eq(recommendations.status, "PENDING"),
        ),
      );

    // IEP goals summary
    const goals = await this.app.db
      .select()
      .from(iepGoals)
      .where(eq(iepGoals.learnerId, learnerId));

    const iepSummary = {
      total: goals.length,
      met: goals.filter((g) => g.status === "MET").length,
      onTrack: goals.filter((g) => {
        const target = parseFloat(g.targetValue ?? "0");
        const current = parseFloat(g.currentValue ?? "0");
        return g.status === "ACTIVE" && target > 0 && current / target >= 0.5;
      }).length,
      atRisk: goals.filter((g) => {
        const target = parseFloat(g.targetValue ?? "0");
        const current = parseFloat(g.currentValue ?? "0");
        return g.status === "ACTIVE" && (target === 0 || current / target < 0.5);
      }).length,
    };

    // Engagement data
    let engagement = { currentStreak: 0, level: 1, xpToday: 0 };
    const [xpRecord] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    if (xpRecord) {
      engagement = {
        currentStreak: xpRecord.currentStreakDays,
        level: xpRecord.level,
        xpToday: 0, // Would need to sum today's XP events
      };
    }

    // Recent sessions
    const recentSessions = await this.app.db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.learnerId, learnerId))
      .orderBy(desc(learningSessions.createdAt))
      .limit(5);

    const recentActivity = recentSessions.map((s) => ({
      id: s.id,
      sessionType: s.sessionType,
      subject: s.subject,
      createdAt: s.createdAt.toISOString(),
    }));

    const overview = {
      learner: {
        name: learner.name,
        grade: learner.enrolledGrade,
        functioningLevel: learner.functioningLevel,
      },
      brain: brainData,
      pendingRecommendations: pendingRecs.length,
      mastery: masteryData,
      engagement,
      activeTutors,
      iepGoals: iepSummary,
      recentActivity,
    };

    // Cache for 5 minutes
    await this.app.redis.set(cacheKey, JSON.stringify(overview), "EX", CACHE_TTL_SECONDS);

    return overview;
  }

  async getSummary(parentId: string) {
    const learnerList = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.parentId, parentId));

    const summaries = [];
    for (const learner of learnerList) {
      const pendingRecs = await this.app.db
        .select()
        .from(recommendations)
        .where(
          and(
            eq(recommendations.learnerId, learner.id),
            eq(recommendations.status, "PENDING"),
          ),
        );

      const [xpRecord] = await this.app.db
        .select()
        .from(learnerXp)
        .where(eq(learnerXp.learnerId, learner.id))
        .limit(1);

      summaries.push({
        learnerId: learner.id,
        name: learner.name,
        grade: learner.enrolledGrade,
        functioningLevel: learner.functioningLevel,
        pendingRecommendations: pendingRecs.length,
        currentStreak: xpRecord?.currentStreakDays ?? 0,
        level: xpRecord?.level ?? 1,
      });
    }

    return { children: summaries };
  }

  private summarizeMastery(masteryLevels: Record<string, Record<string, number>>): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const [subject, skills] of Object.entries(masteryLevels)) {
      const values = Object.values(skills);
      summary[subject] = values.length > 0
        ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100
        : 0;
    }
    return summary;
  }
}
