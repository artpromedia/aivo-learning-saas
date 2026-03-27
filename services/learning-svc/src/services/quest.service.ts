import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { quests, learnerQuests } from "@aivo/db";
import { ALL_QUEST_WORLDS, getQuestWorldBySlug, getGradeBand } from "../data/quest-worlds/index.js";
import type { QuestWorldDefinition } from "../data/quest-worlds/index.js";

export interface QuestWorldView {
  slug: string;
  title: string;
  description: string;
  subject: string;
  tutorPersona: string;
  totalChapters: number;
  totalXp: number;
  progress?: {
    currentChapter: number;
    status: string;
    startedAt: string;
  };
}

export interface QuestWorldDetailView extends QuestWorldView {
  chapters: Array<{
    number: number;
    title: string;
    hasBoss: boolean;
    xpReward: number;
    unlocked: boolean;
    completed: boolean;
  }>;
}

export class QuestService {
  constructor(private readonly app: FastifyInstance) {}

  async getWorlds(learnerId: string, enrolledGrade: number | null): Promise<QuestWorldView[]> {
    const gradeBand = getGradeBand(enrolledGrade);

    // Get learner's active quests
    const activeQuests = await this.app.db
      .select()
      .from(learnerQuests)
      .where(eq(learnerQuests.learnerId, learnerId));

    // Get quest records to map IDs to slugs
    const questRecords = await this.app.db.select().from(quests);
    const questIdToSlug = new Map(questRecords.map((q) => [q.id, q.slug]));
    const questSlugToId = new Map(questRecords.map((q) => [q.slug, q.id]));

    return ALL_QUEST_WORLDS
      .filter((w) => w.gradeBands[gradeBand] !== undefined)
      .map((world) => {
        const questId = questSlugToId.get(world.slug);
        const learnerQuest = activeQuests.find((q) => q.questId === questId);

        const view: QuestWorldView = {
          slug: world.slug,
          title: world.title,
          description: world.description,
          subject: world.subject,
          tutorPersona: world.tutorPersona,
          totalChapters: world.chapters.length,
          totalXp: world.totalXp,
        };

        if (learnerQuest) {
          view.progress = {
            currentChapter: learnerQuest.currentChapter,
            status: learnerQuest.status,
            startedAt: learnerQuest.startedAt.toISOString(),
          };
        }

        return view;
      });
  }

  async getWorldDetail(
    worldSlug: string,
    learnerId: string,
  ): Promise<QuestWorldDetailView | null> {
    const world = getQuestWorldBySlug(worldSlug);
    if (!world) return null;

    const questRecord = await this.getOrCreateQuestRecord(world);
    const learnerQuest = await this.getLearnerQuest(learnerId, questRecord.id);
    const currentChapter = learnerQuest?.currentChapter ?? 0;

    return {
      slug: world.slug,
      title: world.title,
      description: world.description,
      subject: world.subject,
      tutorPersona: world.tutorPersona,
      totalChapters: world.chapters.length,
      totalXp: world.totalXp,
      progress: learnerQuest
        ? {
            currentChapter: learnerQuest.currentChapter,
            status: learnerQuest.status,
            startedAt: learnerQuest.startedAt.toISOString(),
          }
        : undefined,
      chapters: world.chapters.map((ch) => ({
        number: ch.number,
        title: ch.title,
        hasBoss: ch.hasBoss,
        xpReward: ch.xpReward,
        unlocked: ch.number <= currentChapter + 1,
        completed: ch.number <= currentChapter,
      })),
    };
  }

  async startQuest(
    worldSlug: string,
    learnerId: string,
  ): Promise<{ questId: string; learnerQuestId: string }> {
    const world = getQuestWorldBySlug(worldSlug);
    if (!world) {
      throw Object.assign(new Error("Quest world not found"), { statusCode: 404 });
    }

    const questRecord = await this.getOrCreateQuestRecord(world);

    // Check if already active
    const existing = await this.getLearnerQuest(learnerId, questRecord.id);
    if (existing && existing.status === "ACTIVE") {
      return { questId: questRecord.id, learnerQuestId: existing.id };
    }

    const [learnerQuest] = await this.app.db
      .insert(learnerQuests)
      .values({
        learnerId,
        questId: questRecord.id,
        currentChapter: 0,
        status: "ACTIVE",
      })
      .onConflictDoUpdate({
        target: [learnerQuests.learnerId, learnerQuests.questId],
        set: { status: "ACTIVE", currentChapter: 0, completedAt: null },
      })
      .returning();

    return { questId: questRecord.id, learnerQuestId: learnerQuest.id };
  }

  async getProgress(learnerId: string) {
    const activeQuests = await this.app.db
      .select({
        learnerQuest: learnerQuests,
        quest: quests,
      })
      .from(learnerQuests)
      .innerJoin(quests, eq(learnerQuests.questId, quests.id))
      .where(eq(learnerQuests.learnerId, learnerId));

    return activeQuests.map((row) => ({
      questSlug: row.quest.slug,
      questTitle: row.quest.title,
      subject: row.quest.subject,
      currentChapter: row.learnerQuest.currentChapter,
      totalChapters: (row.quest.chapters as Array<unknown>).length,
      status: row.learnerQuest.status,
      startedAt: row.learnerQuest.startedAt.toISOString(),
      completedAt: row.learnerQuest.completedAt?.toISOString() ?? null,
    }));
  }

  async getOrCreateQuestRecord(world: QuestWorldDefinition) {
    const [existing] = await this.app.db
      .select()
      .from(quests)
      .where(eq(quests.slug, world.slug))
      .limit(1);

    if (existing) return existing;

    const [created] = await this.app.db
      .insert(quests)
      .values({
        slug: world.slug,
        title: world.title,
        description: world.description,
        subject: world.subject,
        gradeBand: Object.keys(world.gradeBands).join(","),
        chapters: world.chapters,
        totalXp: world.totalXp,
      })
      .returning();

    return created;
  }

  async getLearnerQuest(learnerId: string, questId: string) {
    const [existing] = await this.app.db
      .select()
      .from(learnerQuests)
      .where(
        and(
          eq(learnerQuests.learnerId, learnerId),
          eq(learnerQuests.questId, questId),
        ),
      )
      .limit(1);

    return existing ?? null;
  }

  async advanceChapter(learnerQuestId: string, nextChapter: number): Promise<void> {
    await this.app.db
      .update(learnerQuests)
      .set({ currentChapter: nextChapter })
      .where(eq(learnerQuests.id, learnerQuestId));
  }

  async completeQuest(learnerQuestId: string): Promise<void> {
    await this.app.db
      .update(learnerQuests)
      .set({ status: "COMPLETED", completedAt: new Date() })
      .where(eq(learnerQuests.id, learnerQuestId));
  }
}
