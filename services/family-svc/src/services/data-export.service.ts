import type { FastifyInstance } from "fastify";
import { eq, desc } from "drizzle-orm";
import { publishEvent } from "@aivo/events";
import {
  learners, brainStates, brainStateSnapshots, brainEpisodes,
  learningSessions, recommendations, iepDocuments, iepGoals,
  learnerXp, xpEvents, learnerBadges, badges, learnerQuests, quests,
} from "@aivo/db";

export interface ExportResult {
  exportId: string;
  status: "processing" | "ready" | "failed";
  downloadUrl?: string;
  expiresAt?: string;
}

export class DataExportService {
  constructor(private readonly app: FastifyInstance) {}

  async initiateExport(learnerId: string, requestedBy: string): Promise<ExportResult> {
    const exportId = crypto.randomUUID();

    // Collect all data categories
    const exportData = await this.collectAllData(learnerId);

    // Package as JSON
    const jsonContent = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonContent, "utf-8");

    // Upload to S3
    const key = `exports/${learnerId}/${exportId}.json`;
    await this.app.s3.uploadExport(key, buffer, "application/json");

    // Generate signed URL with 72h expiry
    const downloadUrl = await this.app.s3.getSignedUrl(key, 72 * 3600);
    const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    // Notify parent via email
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    if (learner) {
      await publishEvent(this.app.nats, "comms.notification.created", {
        userId: requestedBy,
        type: "data_export_ready",
        title: `Data export ready for ${learner.name}`,
        body: "Your child's complete Brain data export is ready for download. The link expires in 72 hours.",
        actionUrl: downloadUrl,
      });
    }

    return {
      exportId,
      status: "ready",
      downloadUrl,
      expiresAt,
    };
  }

  async collectAllData(learnerId: string): Promise<Record<string, unknown>> {
    // Learner profile
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    // Brain state
    const [brainState] = await this.app.db
      .select()
      .from(brainStates)
      .where(eq(brainStates.learnerId, learnerId))
      .limit(1);

    // Brain snapshots
    let snapshots: unknown[] = [];
    if (brainState) {
      snapshots = await this.app.db
        .select()
        .from(brainStateSnapshots)
        .where(eq(brainStateSnapshots.brainStateId, brainState.id))
        .orderBy(desc(brainStateSnapshots.createdAt));
    }

    // Brain episodes
    let episodes: unknown[] = [];
    if (brainState) {
      episodes = await this.app.db
        .select()
        .from(brainEpisodes)
        .where(eq(brainEpisodes.brainStateId, brainState.id))
        .orderBy(desc(brainEpisodes.createdAt));
    }

    // Learning sessions
    const sessions = await this.app.db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.learnerId, learnerId))
      .orderBy(desc(learningSessions.createdAt));

    // Recommendations
    const recs = await this.app.db
      .select()
      .from(recommendations)
      .where(eq(recommendations.learnerId, learnerId))
      .orderBy(desc(recommendations.createdAt));

    // IEP documents and goals
    const iepDocs = await this.app.db
      .select()
      .from(iepDocuments)
      .where(eq(iepDocuments.learnerId, learnerId));

    const goals = await this.app.db
      .select()
      .from(iepGoals)
      .where(eq(iepGoals.learnerId, learnerId));

    // Engagement
    const [xpRecord] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    const xpHistory = await this.app.db
      .select()
      .from(xpEvents)
      .where(eq(xpEvents.learnerId, learnerId))
      .orderBy(desc(xpEvents.createdAt));

    const earnedBadges = await this.app.db
      .select({ badge: badges, earnedAt: learnerBadges.earnedAt })
      .from(learnerBadges)
      .innerJoin(badges, eq(learnerBadges.badgeId, badges.id))
      .where(eq(learnerBadges.learnerId, learnerId));

    const questProgress = await this.app.db
      .select({ quest: learnerQuests, questDef: quests })
      .from(learnerQuests)
      .innerJoin(quests, eq(learnerQuests.questId, quests.id))
      .where(eq(learnerQuests.learnerId, learnerId));

    return {
      exportedAt: new Date().toISOString(),
      learner: learner ?? null,
      brain: {
        state: brainState ?? null,
        snapshots,
        episodes,
      },
      learning: {
        sessions,
      },
      recommendations: recs,
      iep: {
        documents: iepDocs,
        goals,
      },
      engagement: {
        xp: xpRecord ?? null,
        xpHistory,
        badges: earnedBadges,
        quests: questProgress,
      },
    };
  }
}
