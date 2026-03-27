import type { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { recommendations, brainStates } from "@aivo/db";
import { publishEvent } from "@aivo/events";

export type RecommendationType =
  | "CURRICULUM_ADJUSTMENT" | "ACCOMMODATION_CHANGE" | "FUNCTIONING_LEVEL_CHANGE"
  | "TUTOR_ADDON" | "IEP_GOAL_UPDATE" | "ENGAGEMENT_BOOST"
  | "PARENT_MEDIATED_ACTIVITY" | "ASSESSMENT_REBASELINE" | "DIFFICULTY_ADJUSTMENT"
  | "MODALITY_SWITCH" | "BREAK_SUGGESTION" | "CELEBRATION" | "REGRESSION_ALERT";

const RECOMMENDATION_TITLES: Record<string, string> = {
  CURRICULUM_ADJUSTMENT: "Curriculum path adjustment suggested",
  ACCOMMODATION_CHANGE: "Accommodation change recommended",
  FUNCTIONING_LEVEL_CHANGE: "Functioning level update recommended",
  TUTOR_ADDON: "AI Tutor suggested for additional support",
  IEP_GOAL_UPDATE: "IEP goal progress update",
  ENGAGEMENT_BOOST: "Engagement boost recommendation",
  PARENT_MEDIATED_ACTIVITY: "Parent activity suggestion for home practice",
  ASSESSMENT_REBASELINE: "Assessment re-baseline suggested",
  DIFFICULTY_ADJUSTMENT: "Difficulty level adjustment needed",
  MODALITY_SWITCH: "Learning modality change recommended",
  BREAK_SUGGESTION: "Break activity recommended",
  CELEBRATION: "Achievement celebration!",
  REGRESSION_ALERT: "Skill regression detected — review suggested",
};

export class RecommendationService {
  constructor(private readonly app: FastifyInstance) {}

  async getPendingAndRecent(learnerId: string) {
    const pending = await this.app.db
      .select()
      .from(recommendations)
      .where(
        and(
          eq(recommendations.learnerId, learnerId),
          eq(recommendations.status, "PENDING"),
        ),
      )
      .orderBy(desc(recommendations.createdAt));

    const recent = await this.app.db
      .select()
      .from(recommendations)
      .where(eq(recommendations.learnerId, learnerId))
      .orderBy(desc(recommendations.respondedAt))
      .limit(10);

    const recentResolved = recent.filter((r) => r.status !== "PENDING");

    return {
      pending: pending.map((r) => this.formatRecommendation(r)),
      recent: recentResolved.map((r) => this.formatRecommendation(r)),
    };
  }

  async respond(
    recommendationId: string,
    userId: string,
    action: "APPROVE" | "DECLINE" | "ADJUST",
    adjustText?: string,
  ): Promise<{ success: boolean; message: string }> {
    const [rec] = await this.app.db
      .select()
      .from(recommendations)
      .where(eq(recommendations.id, recommendationId))
      .limit(1);

    if (!rec) {
      throw Object.assign(new Error("Recommendation not found"), { statusCode: 404 });
    }

    if (rec.status !== "PENDING") {
      throw Object.assign(new Error("Recommendation already resolved"), { statusCode: 400 });
    }

    const now = new Date();

    if (action === "APPROVE") {
      // Apply the Brain change
      await this.app.brainClient.applyRecommendation(
        rec.learnerId,
        rec.id,
        rec.payload,
      );

      await this.app.db
        .update(recommendations)
        .set({
          status: "APPROVED",
          respondedBy: userId,
          respondedAt: now,
          updatedAt: now,
        })
        .where(eq(recommendations.id, rec.id));

      await publishEvent(this.app.nats, "brain.recommendation.responded", {
        learnerId: rec.learnerId,
        recommendationId: rec.id,
        status: "APPROVED" as const,
      });

      return { success: true, message: "Recommendation approved and applied to Brain" };
    }

    if (action === "DECLINE") {
      await this.app.brainClient.declineRecommendation(rec.learnerId, rec.id);

      await this.app.db
        .update(recommendations)
        .set({
          status: "DECLINED",
          respondedBy: userId,
          respondedAt: now,
          reTriggerGapDays: 14,
          updatedAt: now,
        })
        .where(eq(recommendations.id, rec.id));

      await publishEvent(this.app.nats, "brain.recommendation.responded", {
        learnerId: rec.learnerId,
        recommendationId: rec.id,
        status: "DECLINED" as const,
      });

      return { success: true, message: "Recommendation declined. Will re-evaluate in 14 days." };
    }

    if (action === "ADJUST") {
      if (!adjustText) {
        throw Object.assign(new Error("Adjust action requires text"), { statusCode: 400 });
      }

      // Embed insight into Brain context
      await this.app.brainClient.addInsight(rec.learnerId, {
        text: adjustText,
        attribution: "parent",
        userId,
      });

      await this.app.db
        .update(recommendations)
        .set({
          status: "ADJUSTED",
          respondedBy: userId,
          respondedAt: now,
          parentResponseText: adjustText,
          updatedAt: now,
        })
        .where(eq(recommendations.id, rec.id));

      await publishEvent(this.app.nats, "brain.recommendation.responded", {
        learnerId: rec.learnerId,
        recommendationId: rec.id,
        status: "ADJUSTED" as const,
        parentResponse: adjustText,
      });

      return { success: true, message: "Insight saved. Brain will re-evaluate and may issue a new recommendation." };
    }

    throw Object.assign(new Error("Invalid action"), { statusCode: 400 });
  }

  async getHistory(learnerId: string, limit = 50, offset = 0) {
    const history = await this.app.db
      .select()
      .from(recommendations)
      .where(eq(recommendations.learnerId, learnerId))
      .orderBy(desc(recommendations.createdAt))
      .limit(limit)
      .offset(offset);

    return history.map((r) => this.formatRecommendation(r));
  }

  async createRecommendation(data: {
    learnerId: string;
    brainStateId: string;
    type: RecommendationType;
    title?: string;
    description: string;
    payload: Record<string, unknown>;
    previousRecommendationId?: string;
  }) {
    const title = data.title ?? RECOMMENDATION_TITLES[data.type] ?? "Recommendation";

    const [rec] = await this.app.db
      .insert(recommendations)
      .values({
        learnerId: data.learnerId,
        brainStateId: data.brainStateId,
        type: data.type,
        title,
        description: data.description,
        payload: data.payload,
        previousRecommendationId: data.previousRecommendationId,
      })
      .returning();

    return rec;
  }

  getDefaultTitle(type: string): string {
    return RECOMMENDATION_TITLES[type] ?? "Recommendation";
  }

  private formatRecommendation(rec: typeof recommendations.$inferSelect) {
    return {
      id: rec.id,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      payload: rec.payload,
      status: rec.status,
      parentResponseText: rec.parentResponseText,
      respondedAt: rec.respondedAt?.toISOString() ?? null,
      reTriggerGapDays: rec.reTriggerGapDays,
      createdAt: rec.createdAt.toISOString(),
      actions: rec.status === "PENDING" ? ["APPROVE", "DECLINE", "ADJUST"] : [],
    };
  }
}
