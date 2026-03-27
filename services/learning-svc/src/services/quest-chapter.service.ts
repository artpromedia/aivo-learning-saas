import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { learnerQuests, quests } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { getQuestWorldBySlug, getChapterSkills } from "../data/quest-worlds/index.js";
import type { BrainContext } from "../plugins/brain-client.js";
import { QuestService } from "./quest.service.js";

export interface ChapterContent {
  chapterNumber: number;
  title: string;
  hasBoss: boolean;
  narrative: string;
  activities: Array<{
    id: string;
    type: string;
    prompt: string;
    options?: string[];
    correctAnswer: string;
    skill: string;
    difficulty: number;
  }>;
  xpReward: number;
}

export class QuestChapterService {
  private readonly questService: QuestService;

  constructor(private readonly app: FastifyInstance) {
    this.questService = new QuestService(app);
  }

  async getChapter(
    questId: string,
    chapterNumber: number,
    learnerId: string,
  ): Promise<ChapterContent> {
    // Get quest record
    const [questRecord] = await this.app.db
      .select()
      .from(quests)
      .where(eq(quests.id, questId))
      .limit(1);

    if (!questRecord) {
      throw Object.assign(new Error("Quest not found"), { statusCode: 404 });
    }

    const world = getQuestWorldBySlug(questRecord.slug);
    if (!world) {
      throw Object.assign(new Error("Quest world definition not found"), { statusCode: 404 });
    }

    const chapter = world.chapters.find((c) => c.number === chapterNumber);
    if (!chapter) {
      throw Object.assign(new Error("Chapter not found"), { statusCode: 404 });
    }

    // Check progression — learner must have completed previous chapters
    const learnerQuest = await this.questService.getLearnerQuest(learnerId, questId);
    if (!learnerQuest) {
      throw Object.assign(new Error("Quest not started"), { statusCode: 400 });
    }

    if (chapterNumber > learnerQuest.currentChapter + 1) {
      throw Object.assign(new Error("Chapter not yet unlocked"), { statusCode: 403 });
    }

    // Fetch Brain context and generate content
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);
    const skills = getChapterSkills(world, chapterNumber, brainContext.enrolledGrade);

    const generated = await this.app.aiClient.generateQuestChapter({
      learnerId,
      questSlug: world.slug,
      chapterNumber,
      subject: world.subject,
      skills,
      tutorPersona: world.tutorPersona,
      narrativeContext: chapter.title,
      brainContext,
    });

    return {
      chapterNumber,
      title: chapter.title,
      hasBoss: chapter.hasBoss,
      narrative: generated.narrative,
      activities: generated.activities,
      xpReward: chapter.xpReward,
    };
  }

  async completeChapter(
    questId: string,
    chapterNumber: number,
    learnerId: string,
  ): Promise<{
    xpEarned: number;
    nextChapter: number | null;
    questCompleted: boolean;
  }> {
    const [questRecord] = await this.app.db
      .select()
      .from(quests)
      .where(eq(quests.id, questId))
      .limit(1);

    if (!questRecord) {
      throw Object.assign(new Error("Quest not found"), { statusCode: 404 });
    }

    const world = getQuestWorldBySlug(questRecord.slug);
    if (!world) {
      throw Object.assign(new Error("Quest world definition not found"), { statusCode: 404 });
    }

    const chapter = world.chapters.find((c) => c.number === chapterNumber);
    if (!chapter) {
      throw Object.assign(new Error("Chapter not found"), { statusCode: 404 });
    }

    const learnerQuest = await this.questService.getLearnerQuest(learnerId, questId);
    if (!learnerQuest) {
      throw Object.assign(new Error("Quest not started"), { statusCode: 400 });
    }

    // Advance chapter
    const isLastChapter = chapterNumber === world.chapters.length;
    const nextChapter = isLastChapter ? null : chapterNumber + 1;

    if (isLastChapter) {
      await this.questService.completeQuest(learnerQuest.id);
    } else {
      await this.questService.advanceChapter(learnerQuest.id, chapterNumber);
    }

    // Publish events
    await publishEvent(this.app.nats, "engagement.xp.earned", {
      learnerId,
      xpAmount: chapter.xpReward,
      activity: "quest_chapter_completed",
      triggerEvent: "quest.chapter.completed",
    });

    return {
      xpEarned: chapter.xpReward,
      nextChapter,
      questCompleted: isLastChapter,
    };
  }
}
