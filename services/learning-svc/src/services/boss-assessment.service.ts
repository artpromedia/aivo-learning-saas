import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { quests } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { getQuestWorldBySlug, getChapterSkills } from "../data/quest-worlds/index.js";
import type { BrainContext } from "../plugins/brain-client.js";
import { QuestService } from "./quest.service.js";
import { SpacedRepetitionService } from "./spaced-repetition.service.js";

export interface BossAssessmentConfig {
  questionCount: number;
  questionType: string;
  choiceCount?: number;
  includeVisualAids: boolean;
  partnerAssisted: boolean;
  parentReported: boolean;
}

export interface BossResult {
  passed: boolean;
  score: number;
  xpEarned: number;
  masteryUpdates: Record<string, number>;
}

const BOSS_XP_REWARDS: Record<number, number> = {
  3: 100,
  6: 150,
  9: 225,
  10: 225,
};

export class BossAssessmentService {
  private readonly questService: QuestService;
  private readonly spacedRepetition: SpacedRepetitionService;

  constructor(private readonly app: FastifyInstance) {
    this.questService = new QuestService(app);
    this.spacedRepetition = new SpacedRepetitionService(app);
  }

  getAssessmentConfig(functioningLevel: string): BossAssessmentConfig {
    switch (functioningLevel) {
      case "STANDARD":
        return {
          questionCount: 10,
          questionType: "adaptive",
          includeVisualAids: false,
          partnerAssisted: false,
          parentReported: false,
        };
      case "SUPPORTED":
        return {
          questionCount: 7,
          questionType: "simplified",
          includeVisualAids: true,
          partnerAssisted: false,
          parentReported: false,
        };
      case "LOW_VERBAL":
        return {
          questionCount: 5,
          questionType: "picture_based",
          choiceCount: 2,
          includeVisualAids: true,
          partnerAssisted: false,
          parentReported: false,
        };
      case "NON_VERBAL":
        return {
          questionCount: 5,
          questionType: "observation",
          includeVisualAids: true,
          partnerAssisted: true,
          parentReported: false,
        };
      case "PRE_SYMBOLIC":
        return {
          questionCount: 3,
          questionType: "milestone_check",
          includeVisualAids: false,
          partnerAssisted: false,
          parentReported: true,
        };
      default:
        return {
          questionCount: 10,
          questionType: "adaptive",
          includeVisualAids: false,
          partnerAssisted: false,
          parentReported: false,
        };
    }
  }

  async generateBossAssessment(
    questId: string,
    learnerId: string,
  ): Promise<{
    config: BossAssessmentConfig;
    content: unknown;
    chapterNumber: number;
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

    const learnerQuest = await this.questService.getLearnerQuest(learnerId, questId);
    if (!learnerQuest) {
      throw Object.assign(new Error("Quest not started"), { statusCode: 400 });
    }

    // Next chapter to complete should be a boss chapter
    const nextChapterNum = learnerQuest.currentChapter + 1;
    const chapter = world.chapters.find((c) => c.number === nextChapterNum);
    if (!chapter || !chapter.hasBoss) {
      throw Object.assign(new Error("No boss assessment at this chapter"), { statusCode: 400 });
    }

    const brainContext = await this.app.brainClient.getBrainContext(learnerId);
    const config = this.getAssessmentConfig(brainContext.functioningLevel);

    // Get all skills covered by chapters up to this boss
    const coveredSkills: string[] = [];
    for (let i = 1; i <= nextChapterNum; i++) {
      coveredSkills.push(...getChapterSkills(world, i, brainContext.enrolledGrade));
    }
    const uniqueSkills = [...new Set(coveredSkills)];

    const content = await this.app.aiClient.generateBossAssessment({
      learnerId,
      subject: world.subject,
      skills: uniqueSkills,
      functioningLevel: brainContext.functioningLevel,
      questionCount: config.questionCount,
      brainContext,
      narrativeTheme: chapter.title,
    });

    return { config, content, chapterNumber: nextChapterNum };
  }

  async submitBossResult(
    questId: string,
    learnerId: string,
    answers: Array<{ questionId: string; answer: string; correct: boolean }>,
  ): Promise<BossResult> {
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

    const learnerQuest = await this.questService.getLearnerQuest(learnerId, questId);
    if (!learnerQuest) {
      throw Object.assign(new Error("Quest not started"), { statusCode: 400 });
    }

    const chapterNumber = learnerQuest.currentChapter + 1;
    const correctCount = answers.filter((a) => a.correct).length;
    const score = answers.length > 0 ? correctCount / answers.length : 0;
    const passed = score >= 0.6;

    const xpReward = BOSS_XP_REWARDS[chapterNumber] ?? 100;
    const xpEarned = passed ? xpReward : Math.round(xpReward * 0.25);

    // Update mastery for covered skills
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);
    const coveredSkills = getChapterSkills(world, chapterNumber, brainContext.enrolledGrade);
    const masteryUpdates: Record<string, number> = {};

    for (const skill of coveredSkills) {
      const delta = passed ? 0.1 : -0.03;
      masteryUpdates[skill] = delta;
      await this.spacedRepetition.processReview(learnerId, world.subject, skill, score);
    }

    if (passed) {
      // Advance chapter
      const isLastChapter = chapterNumber === world.chapters.length;
      if (isLastChapter) {
        await this.questService.completeQuest(learnerQuest.id);
      } else {
        await this.questService.advanceChapter(learnerQuest.id, chapterNumber);
      }
    }

    // Publish XP event
    await publishEvent(this.app.nats, "engagement.xp.earned", {
      learnerId,
      xpAmount: xpEarned,
      activity: "boss_assessment_completed",
      triggerEvent: "quest.chapter.completed",
    });

    return { passed, score, xpEarned, masteryUpdates };
  }
}
