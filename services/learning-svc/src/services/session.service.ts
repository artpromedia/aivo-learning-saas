import type { FastifyInstance } from "fastify";
import { eq, desc } from "drizzle-orm";
import { learningSessions } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import type { BrainContext } from "../plugins/brain-client.js";
import type { GeneratedContent } from "../plugins/ai-client.js";
import { SpacedRepetitionService } from "./spaced-repetition.service.js";

export type SessionType = "LESSON" | "QUIZ" | "READING" | "WRITING";

export interface StartSessionParams {
  learnerId: string;
  subject: string;
  sessionType: SessionType;
  skillTargets?: string[];
}

export interface InteractionParams {
  responseType: string;
  response: unknown;
  timeSpentMs: number;
}

interface Interaction extends InteractionParams {
  timestamp: string;
  correct?: boolean;
  questionId?: string;
}

export interface SessionRecord {
  id: string;
  learnerId: string;
  sessionType: string;
  subject: string;
  skillTargets: string[];
  contentGenerated: GeneratedContent;
  masteryBefore: Record<string, number>;
  masteryAfter: Record<string, number>;
  interactions: Interaction[];
  brainContext: BrainContext;
  startedAt: Date;
  endedAt: Date | null;
}

export class SessionService {
  private readonly spacedRepetition: SpacedRepetitionService;

  constructor(private readonly app: FastifyInstance) {
    this.spacedRepetition = new SpacedRepetitionService(app);
  }

  async startSession(params: StartSessionParams): Promise<SessionRecord> {
    const { learnerId, subject, sessionType, skillTargets } = params;

    // 1. Fetch Brain context
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);

    // 2. Determine skill targets from mastery gaps if not provided
    const resolvedSkills =
      skillTargets && skillTargets.length > 0
        ? skillTargets
        : this.selectSkillsFromBrain(brainContext, subject, sessionType);

    // 3. Capture mastery before
    const masteryBefore: Record<string, number> = {};
    for (const skill of resolvedSkills) {
      masteryBefore[skill] =
        brainContext.masteryLevels[subject]?.[skill] ?? 0;
    }

    // 4. Generate content via ai-svc
    const content = await this.app.aiClient.generateContent({
      learnerId,
      subject,
      skill: resolvedSkills[0],
      sessionType,
      brainContext,
      difficulty: this.determineDifficulty(brainContext, resolvedSkills[0], subject),
    });

    // 5. Respect attention span for functioning level
    const adjustedContent = this.adjustForFunctioningLevel(content, brainContext);

    // 6. Persist session
    const [session] = await this.app.db
      .insert(learningSessions)
      .values({
        learnerId,
        sessionType,
        subject,
        skillTargets: resolvedSkills,
        contentGenerated: adjustedContent,
        masteryBefore,
        masteryAfter: {},
      })
      .returning();

    // 7. Store session metadata in Redis for fast interaction lookups
    const sessionRecord: SessionRecord = {
      id: session.id,
      learnerId,
      sessionType,
      subject,
      skillTargets: resolvedSkills,
      contentGenerated: adjustedContent,
      masteryBefore,
      masteryAfter: {},
      interactions: [],
      brainContext,
      startedAt: session.startedAt,
      endedAt: null,
    };

    await this.app.redis.set(
      `session:${session.id}`,
      JSON.stringify(sessionRecord),
      "EX",
      86400, // 24h TTL
    );

    return sessionRecord;
  }

  async addInteraction(sessionId: string, interaction: InteractionParams): Promise<SessionRecord> {
    const session = await this.getSessionFromRedis(sessionId);
    if (!session) {
      throw Object.assign(new Error("Session not found"), { statusCode: 404 });
    }

    const fullInteraction: Interaction = {
      ...interaction,
      timestamp: new Date().toISOString(),
    };

    // Check correctness for quiz-type responses
    if (interaction.responseType === "answer" && session.contentGenerated.questions) {
      const question = session.contentGenerated.questions.find(
        (q) => q.id === (interaction.response as { questionId?: string })?.questionId,
      );
      if (question) {
        fullInteraction.questionId = question.id;
        fullInteraction.correct =
          String((interaction.response as { answer?: string })?.answer).toLowerCase() ===
          String(question.correctAnswer).toLowerCase();
      }
    }

    session.interactions.push(fullInteraction);

    await this.app.redis.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      "EX",
      86400,
    );

    return session;
  }

  async completeSession(sessionId: string): Promise<SessionRecord> {
    const session = await this.getSessionFromRedis(sessionId);
    if (!session) {
      throw Object.assign(new Error("Session not found"), { statusCode: 404 });
    }

    // 1. Calculate mastery delta from interactions
    const { masteryAfter, overallScore } = this.calculateMasteryDelta(session);
    session.masteryAfter = masteryAfter;
    session.endedAt = new Date();

    // 2. Update database record
    await this.app.db
      .update(learningSessions)
      .set({
        masteryAfter,
        endedAt: session.endedAt,
      })
      .where(eq(learningSessions.id, sessionId));

    // 3. Publish completion events
    const primarySkill = session.skillTargets[0];
    const masteryDelta =
      (masteryAfter[primarySkill] ?? 0) - (session.masteryBefore[primarySkill] ?? 0);

    if (session.sessionType === "QUIZ") {
      const totalQuestions = session.contentGenerated.questions?.length ?? 1;
      await publishEvent(this.app.nats, "quiz.completed", {
        learnerId: session.learnerId,
        sessionId,
        subject: session.subject,
        score: overallScore,
        totalQuestions,
      });

      if (overallScore === 1) {
        await publishEvent(this.app.nats, "quiz.perfect_score", {
          learnerId: session.learnerId,
          sessionId,
          subject: session.subject,
        });
      }
    } else {
      await publishEvent(this.app.nats, "lesson.completed", {
        learnerId: session.learnerId,
        sessionId,
        subject: session.subject,
        skill: primarySkill,
        masteryDelta,
      });
    }

    // 4. XP rewards
    let xpAmount = 10; // Base lesson XP
    if (session.sessionType === "QUIZ") xpAmount = 25;
    if (overallScore === 1) xpAmount = 50;

    await publishEvent(this.app.nats, "engagement.xp.earned", {
      learnerId: session.learnerId,
      xpAmount,
      activity: `${session.sessionType.toLowerCase()}_completed`,
      triggerEvent: session.sessionType === "QUIZ" ? "quiz.completed" : "lesson.completed",
    });

    // 5. Update spaced repetition schedule for each practiced skill
    for (const skill of session.skillTargets) {
      const skillScore = masteryAfter[skill] ?? overallScore;
      await this.spacedRepetition.processReview(
        session.learnerId,
        session.subject,
        skill,
        skillScore,
      );
    }

    // 6. Check focus milestones
    const totalTimeMs = session.interactions.reduce((sum, i) => sum + i.timeSpentMs, 0);
    if (totalTimeMs >= 30 * 60 * 1000) {
      await publishEvent(this.app.nats, "focus.session_30min", {
        learnerId: session.learnerId,
        sessionId,
      });
    }
    if (totalTimeMs >= 90 * 60 * 1000) {
      await publishEvent(this.app.nats, "focus.session_90min", {
        learnerId: session.learnerId,
        sessionId,
      });
    }

    // 7. Clean up Redis cache
    await this.app.redis.del(`session:${sessionId}`);

    return session;
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    // Try Redis first for active sessions
    const cached = await this.getSessionFromRedis(sessionId);
    if (cached) return cached;

    // Fall back to database for completed sessions
    const [row] = await this.app.db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, sessionId))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      learnerId: row.learnerId,
      sessionType: row.sessionType,
      subject: row.subject,
      skillTargets: row.skillTargets as string[],
      contentGenerated: row.contentGenerated as GeneratedContent,
      masteryBefore: (row.masteryBefore ?? {}) as Record<string, number>,
      masteryAfter: (row.masteryAfter ?? {}) as Record<string, number>,
      interactions: [],
      brainContext: {} as BrainContext,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
    };
  }

  async getHistory(learnerId: string, limit = 20, offset = 0) {
    const rows = await this.app.db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.learnerId, learnerId))
      .orderBy(desc(learningSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => ({
      id: row.id,
      sessionType: row.sessionType,
      subject: row.subject,
      skillTargets: row.skillTargets,
      masteryBefore: row.masteryBefore,
      masteryAfter: row.masteryAfter,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      createdAt: row.createdAt,
    }));
  }

  generateNextRecommendation(session: SessionRecord): {
    type: SessionType;
    subject: string;
    skill: string;
    reason: string;
  } {
    const overallScore = this.computeOverallScore(session);

    if (overallScore < 0.5) {
      return {
        type: "LESSON",
        subject: session.subject,
        skill: session.skillTargets[0],
        reason: "reinforcement_needed",
      };
    }

    if (overallScore < 0.7) {
      return {
        type: "LESSON",
        subject: session.subject,
        skill: session.skillTargets[0],
        reason: "approaching_mastery",
      };
    }

    // If mastered, recommend quiz assessment
    return {
      type: "QUIZ",
      subject: session.subject,
      skill: session.skillTargets[0],
      reason: "ready_for_assessment",
    };
  }

  private selectSkillsFromBrain(
    brainContext: BrainContext,
    subject: string,
    sessionType: string,
  ): string[] {
    if (sessionType === "LESSON" || sessionType === "QUIZ") {
      const subjectGaps = brainContext.masteryGaps
        .filter((g) => g.subject === subject)
        .sort((a, b) => a.level - b.level);

      if (subjectGaps.length > 0) {
        return subjectGaps.slice(0, 3).map((g) => g.skill);
      }
    }
    return ["general_practice"];
  }

  private determineDifficulty(
    brainContext: BrainContext,
    skill: string,
    subject: string,
  ): string {
    const currentMastery = brainContext.masteryLevels[subject]?.[skill] ?? 0;
    if (currentMastery < 0.3) return "beginner";
    if (currentMastery < 0.6) return "intermediate";
    if (currentMastery < 0.85) return "advanced";
    return "expert";
  }

  private adjustForFunctioningLevel(
    content: GeneratedContent,
    brainContext: BrainContext,
  ): GeneratedContent {
    const level = brainContext.functioningLevel;
    const attention = brainContext.attentionSpanMinutes;

    if (level === "LOW_VERBAL" || level === "NON_VERBAL" || level === "PRE_SYMBOLIC") {
      const maxDuration = level === "LOW_VERBAL" ? 5 : 3;
      return {
        ...content,
        estimatedDurationMinutes: Math.min(content.estimatedDurationMinutes, maxDuration),
        sections: content.sections.slice(0, 2),
        questions: content.questions?.slice(0, level === "LOW_VERBAL" ? 5 : 3),
      };
    }

    if (level === "SUPPORTED") {
      return {
        ...content,
        estimatedDurationMinutes: Math.min(content.estimatedDurationMinutes, attention || 15),
        questions: content.questions?.slice(0, 7),
      };
    }

    return content;
  }

  private calculateMasteryDelta(session: SessionRecord): {
    masteryAfter: Record<string, number>;
    overallScore: number;
  } {
    const overallScore = this.computeOverallScore(session);
    const masteryAfter: Record<string, number> = {};

    for (const skill of session.skillTargets) {
      const before = session.masteryBefore[skill] ?? 0;
      const delta = overallScore >= 0.7 ? Math.min(0.15, (1 - before) * 0.2) : -0.05;
      masteryAfter[skill] = Math.max(0, Math.min(1, before + delta));
    }

    return { masteryAfter, overallScore };
  }

  private computeOverallScore(session: SessionRecord): number {
    const answeredInteractions = session.interactions.filter(
      (i) => i.correct !== undefined,
    );

    if (answeredInteractions.length === 0) {
      // For lessons without quiz interactions, check progress
      const progressInteractions = session.interactions.filter(
        (i) => i.responseType === "progress",
      );
      return progressInteractions.length > 0 ? 0.8 : 0.5;
    }

    const correctCount = answeredInteractions.filter((i) => i.correct).length;
    return correctCount / answeredInteractions.length;
  }

  private async getSessionFromRedis(sessionId: string): Promise<SessionRecord | null> {
    const raw = await this.app.redis.get(`session:${sessionId}`);
    if (!raw) return null;
    return JSON.parse(raw) as SessionRecord;
  }
}
