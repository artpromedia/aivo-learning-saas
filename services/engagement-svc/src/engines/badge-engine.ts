import type { FastifyInstance } from "fastify";
import { eq, and, sql } from "drizzle-orm";
import { badges, learnerBadges, learnerQuests, xpEvents, learningSessions } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { BADGE_DEFINITIONS, type BadgeCriteria } from "../data/badge-definitions.js";
import type { BrainEngagementProfile } from "../plugins/brain-client.js";

export class BadgeEngine {
  constructor(private readonly app: FastifyInstance) {}

  async evaluateAllBadges(learnerId: string, triggerEvent?: string): Promise<string[]> {
    const earnedSlugs = await this.getEarnedBadgeSlugs(learnerId);
    const awarded: string[] = [];

    for (const def of BADGE_DEFINITIONS) {
      if (earnedSlugs.has(def.slug)) continue;

      const met = await this.evaluateCriteria(learnerId, def.criteria, triggerEvent);
      if (met) {
        await this.awardBadge(learnerId, def.slug);
        awarded.push(def.slug);
      }
    }

    return awarded;
  }

  async evaluateCriteria(
    learnerId: string,
    criteria: BadgeCriteria,
    triggerEvent?: string,
  ): Promise<boolean> {
    switch (criteria.type) {
      case "first_lesson":
        return (await this.checkEventCount(learnerId, "lesson.completed")) >= 1;

      case "brain_cloned":
        return triggerEvent === "brain.cloned" ||
          (await this.checkEventCount(learnerId, "brain.cloned")) >= 1;

      case "streak_days": {
        const streakRaw = await this.app.redis.hget(`streak:${learnerId}`, "longestStreak");
        const longest = parseInt(streakRaw || "0", 10);
        return longest >= criteria.days;
      }

      case "perfect_score":
        return (await this.checkEventCount(learnerId, "quiz.perfect_score")) >= criteria.count;

      case "mastery_skills": {
        try {
          const profile = await this.app.brainClient.getEngagementProfile(learnerId);
          const subjectMastery = profile.masteryLevels[criteria.subject] ?? {};
          const masteredCount = Object.values(subjectMastery)
            .filter((level) => level >= criteria.threshold).length;
          return masteredCount >= criteria.count;
        } catch {
          return false;
        }
      }

      case "lesson_count":
        return (await this.checkEventCount(learnerId, "lesson.completed")) >= criteria.count;

      case "session_count":
        return (await this.checkSessionCount(learnerId, criteria.sessionType, criteria.minQuality)) >= criteria.count;

      case "quest_completed": {
        const completed = await this.app.db
          .select()
          .from(learnerQuests)
          .where(
            and(
              eq(learnerQuests.learnerId, learnerId),
              eq(learnerQuests.status, "COMPLETED"),
            ),
          );
        return completed.length >= criteria.count;
      }

      case "challenge_wins": {
        const wins = await this.getChallengeWins(learnerId);
        return wins >= criteria.count;
      }

      case "peer_helps": {
        const helps = await this.checkEventCount(learnerId, "engagement.peer_help");
        return helps >= criteria.count;
      }

      case "subjects_tried": {
        const subjects = await this.getDistinctSubjects(learnerId);
        return subjects >= criteria.count;
      }

      case "iep_goal_met":
        return (await this.checkEventCount(learnerId, "brain.iep_goal.met")) >= criteria.count;

      default:
        return false;
    }
  }

  async awardBadge(learnerId: string, badgeSlug: string): Promise<void> {
    // Get or create badge record
    let [badgeRecord] = await this.app.db
      .select()
      .from(badges)
      .where(eq(badges.slug, badgeSlug))
      .limit(1);

    if (!badgeRecord) {
      const def = BADGE_DEFINITIONS.find((b) => b.slug === badgeSlug);
      if (!def) return;

      [badgeRecord] = await this.app.db
        .insert(badges)
        .values({
          slug: def.slug,
          name: def.name,
          description: def.description,
          category: def.category,
          iconUrl: def.iconUrl,
          criteria: def.criteria,
        })
        .returning();
    }

    // Award to learner
    await this.app.db
      .insert(learnerBadges)
      .values({ learnerId, badgeId: badgeRecord.id })
      .onConflictDoNothing();

    // Publish event
    await publishEvent(this.app.nats, "engagement.badge.earned", {
      learnerId,
      badgeSlug,
    });
  }

  async getEarnedBadges(learnerId: string) {
    const earned = await this.app.db
      .select({ badge: badges, earnedAt: learnerBadges.earnedAt })
      .from(learnerBadges)
      .innerJoin(badges, eq(learnerBadges.badgeId, badges.id))
      .where(eq(learnerBadges.learnerId, learnerId));

    return earned.map((row) => ({
      slug: row.badge.slug,
      name: row.badge.name,
      description: row.badge.description,
      category: row.badge.category,
      iconUrl: row.badge.iconUrl,
      earnedAt: row.earnedAt.toISOString(),
    }));
  }

  async getBadgeProgress(learnerId: string) {
    const earnedSlugs = await this.getEarnedBadgeSlugs(learnerId);

    return BADGE_DEFINITIONS
      .filter((def) => !earnedSlugs.has(def.slug))
      .map((def) => ({
        slug: def.slug,
        name: def.name,
        description: def.description,
        criteria: def.criteria,
        earned: false,
      }));
  }

  private async getEarnedBadgeSlugs(learnerId: string): Promise<Set<string>> {
    const earned = await this.app.db
      .select({ slug: badges.slug })
      .from(learnerBadges)
      .innerJoin(badges, eq(learnerBadges.badgeId, badges.id))
      .where(eq(learnerBadges.learnerId, learnerId));

    return new Set(earned.map((e) => e.slug));
  }

  private async checkEventCount(learnerId: string, eventType: string): Promise<number> {
    const result = await this.app.db
      .select({ count: sql<number>`count(*)::int` })
      .from(xpEvents)
      .where(
        and(
          eq(xpEvents.learnerId, learnerId),
          eq(xpEvents.activity, eventType),
        ),
      );
    return result[0]?.count ?? 0;
  }

  private async checkSessionCount(
    learnerId: string,
    sessionType: string,
    _minQuality?: number,
  ): Promise<number> {
    const subjectMap: Record<string, string> = {
      reading: "READING",
      homework: "HOMEWORK",
    };
    const dbSessionType = subjectMap[sessionType] ?? sessionType.toUpperCase();

    const result = await this.app.db
      .select({ count: sql<number>`count(*)::int` })
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          eq(learningSessions.sessionType, dbSessionType as "LESSON"),
        ),
      );
    return result[0]?.count ?? 0;
  }

  private async getChallengeWins(learnerId: string): Promise<number> {
    const key = `challenge_wins:${learnerId}`;
    const wins = await this.app.redis.get(key);
    return parseInt(wins || "0", 10);
  }

  private async getDistinctSubjects(learnerId: string): Promise<number> {
    const result = await this.app.db
      .select({ count: sql<number>`count(distinct subject)::int` })
      .from(learningSessions)
      .where(eq(learningSessions.learnerId, learnerId));
    return result[0]?.count ?? 0;
  }
}
