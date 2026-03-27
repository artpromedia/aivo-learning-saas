import type { FastifyInstance } from "fastify";
import type { BrainContext } from "../plugins/brain-client.js";
import { SpacedRepetitionService } from "./spaced-repetition.service.js";

const MASTERY_THRESHOLD = 0.7;

export interface PathActivity {
  type: "lesson" | "review" | "quiz" | "quest" | "practice";
  subject: string;
  skill: string;
  reason: string;
  priority: number;
  estimatedMinutes?: number;
}

export interface DailyLearningPath {
  date: string;
  learnerId: string;
  functioningLevel: string;
  activities: PathActivity[];
}

export class LearningPathService {
  private readonly spacedRepetition: SpacedRepetitionService;

  constructor(private readonly app: FastifyInstance) {
    this.spacedRepetition = new SpacedRepetitionService(app);
  }

  async generateDailyPath(learnerId: string): Promise<DailyLearningPath> {
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);
    const today = new Date().toISOString().split("T")[0];

    const activities: PathActivity[] = [];

    // 1. Spaced repetition due items (highest priority)
    const dueItems = await this.spacedRepetition.getDueItems(learnerId);
    for (const item of dueItems.slice(0, 2)) {
      activities.push({
        type: "review",
        subject: item.subject,
        skill: item.skill,
        reason: "spaced_repetition_due",
        priority: 1,
        estimatedMinutes: this.getSessionDuration(brainContext),
      });
    }

    // 2. Mastery gap lessons (medium priority)
    const gapActivities = this.buildGapActivities(brainContext);
    activities.push(...gapActivities.slice(0, 3));

    // 3. Quest engagement activity (lower priority)
    const questActivity = this.buildQuestActivity(brainContext);
    if (questActivity) {
      activities.push(questActivity);
    }

    // Sort by priority
    activities.sort((a, b) => a.priority - b.priority);

    // Respect daily limits based on functioning level
    const maxActivities = this.getMaxDailyActivities(brainContext);

    return {
      date: today,
      learnerId,
      functioningLevel: brainContext.functioningLevel,
      activities: activities.slice(0, maxActivities),
    };
  }

  async getNextRecommendation(learnerId: string): Promise<PathActivity | null> {
    const path = await this.generateDailyPath(learnerId);
    return path.activities[0] ?? null;
  }

  async getSpacedReviewItems(learnerId: string): Promise<PathActivity[]> {
    const dueItems = await this.spacedRepetition.getDueItems(learnerId);
    return dueItems.map((item) => ({
      type: "review" as const,
      subject: item.subject,
      skill: item.skill,
      reason: "spaced_repetition_due",
      priority: 1,
      estimatedMinutes: 10,
    }));
  }

  async initializeForNewLearner(learnerId: string): Promise<DailyLearningPath> {
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);

    // Initialize SR items for all mastery gaps
    for (const gap of brainContext.masteryGaps) {
      await this.spacedRepetition.initializeItem(learnerId, gap.subject, gap.skill);
    }

    return this.generateDailyPath(learnerId);
  }

  private buildGapActivities(brainContext: BrainContext): PathActivity[] {
    const gaps = brainContext.masteryGaps
      .filter((g) => g.level < MASTERY_THRESHOLD)
      .sort((a, b) => a.level - b.level);

    return gaps.map((gap, idx) => ({
      type: gap.level < 0.4 ? ("lesson" as const) : ("practice" as const),
      subject: gap.subject,
      skill: gap.skill,
      reason: "mastery_gap",
      priority: 2 + idx,
      estimatedMinutes: this.getSessionDuration(brainContext),
    }));
  }

  private buildQuestActivity(brainContext: BrainContext): PathActivity | null {
    // Recommend quest based on the subject with the highest current mastery
    // (engagement reward for strong areas)
    const subjects = Object.keys(brainContext.masteryLevels);
    if (subjects.length === 0) return null;

    let bestSubject = subjects[0];
    let bestAvg = 0;

    for (const subject of subjects) {
      const skills = brainContext.masteryLevels[subject];
      const values = Object.values(skills);
      if (values.length === 0) continue;
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestSubject = subject;
      }
    }

    return {
      type: "quest",
      subject: bestSubject,
      skill: "quest_engagement",
      reason: "engagement",
      priority: 10,
      estimatedMinutes: this.getSessionDuration(brainContext),
    };
  }

  private getSessionDuration(brainContext: BrainContext): number {
    const level = brainContext.functioningLevel;
    if (level === "PRE_SYMBOLIC") return 3;
    if (level === "NON_VERBAL") return 5;
    if (level === "LOW_VERBAL") return 5;
    if (level === "SUPPORTED") return 10;
    return brainContext.attentionSpanMinutes || 15;
  }

  private getMaxDailyActivities(brainContext: BrainContext): number {
    const level = brainContext.functioningLevel;
    if (level === "PRE_SYMBOLIC") return 2;
    if (level === "NON_VERBAL") return 3;
    if (level === "LOW_VERBAL") return 3;
    if (level === "SUPPORTED") return 4;
    return 6;
  }
}
