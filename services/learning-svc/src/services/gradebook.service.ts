import type { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { learningSessions, learners } from "@aivo/db";
import type { BrainContext } from "../plugins/brain-client.js";

export interface MasteryLabel {
  percentage: number;
  label: string;
  indicator: string;
}

export interface SkillMastery {
  skill: string;
  mastery: number;
  label: string;
  indicator: string;
  trend: "improving" | "stable" | "declining";
  attemptCount: number;
  lastAttemptDate: string | null;
}

export interface SubjectGrade {
  subject: string;
  overallMastery: number;
  label: string;
  indicator: string;
  skills: SkillMastery[];
}

export interface FunctionalMilestone {
  domain: string;
  milestone: string;
  status: string;
  progress: number;
}

export interface GradebookSummary {
  learnerId: string;
  functioningLevel: string;
  subjects: SubjectGrade[];
  functionalMilestones?: FunctionalMilestone[];
}

export class GradebookService {
  constructor(private readonly app: FastifyInstance) {}

  getMasteryLabel(percentage: number): MasteryLabel {
    if (percentage >= 80) return { percentage, label: "Mastered", indicator: "star" };
    if (percentage >= 60) return { percentage, label: "Approaching", indicator: "green" };
    if (percentage >= 40) return { percentage, label: "Developing", indicator: "yellow" };
    return { percentage, label: "Beginning", indicator: "red" };
  }

  async getSummary(learnerId: string): Promise<GradebookSummary> {
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);

    // Check if learner needs functional milestones instead
    const needsFunctional = ["LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"].includes(
      brainContext.functioningLevel,
    );

    const subjects = await this.buildSubjectGrades(learnerId, brainContext);

    const summary: GradebookSummary = {
      learnerId,
      functioningLevel: brainContext.functioningLevel,
      subjects,
    };

    if (needsFunctional) {
      summary.functionalMilestones = this.buildFunctionalMilestones(brainContext);
    }

    return summary;
  }

  async getSubjectDetail(learnerId: string, subject: string): Promise<SubjectGrade> {
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);
    return this.buildSingleSubjectGrade(learnerId, subject, brainContext);
  }

  async getSkillDetail(
    learnerId: string,
    subject: string,
    skill: string,
  ): Promise<{
    skill: string;
    mastery: number;
    label: string;
    indicator: string;
    trend: "improving" | "stable" | "declining";
    history: Array<{
      sessionId: string;
      date: string;
      masteryBefore: number;
      masteryAfter: number;
      sessionType: string;
    }>;
    iepGoalAlignment: Array<{ goalId: string; goalText: string }>;
  }> {
    const brainContext = await this.app.brainClient.getBrainContext(learnerId);
    const mastery = (brainContext.masteryLevels[subject]?.[skill] ?? 0) * 100;
    const { label, indicator } = this.getMasteryLabel(mastery);

    // Fetch session history for this skill
    const sessions = await this.app.db
      .select()
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          eq(learningSessions.subject, subject),
        ),
      )
      .orderBy(desc(learningSessions.createdAt))
      .limit(50);

    const relevantSessions = sessions.filter((s) => {
      const targets = s.skillTargets as string[];
      return targets.includes(skill);
    });

    const history = relevantSessions.map((s) => ({
      sessionId: s.id,
      date: s.createdAt.toISOString(),
      masteryBefore: (s.masteryBefore as Record<string, number>)?.[skill] ?? 0,
      masteryAfter: (s.masteryAfter as Record<string, number>)?.[skill] ?? 0,
      sessionType: s.sessionType,
    }));

    const trend = this.calculateTrend(history);

    // Find IEP goal alignment
    const iepGoalAlignment = brainContext.iepGoals
      .filter((g) => g.domain.toLowerCase().includes(subject.toLowerCase()) ||
                     g.text.toLowerCase().includes(skill.toLowerCase()))
      .map((g) => ({ goalId: g.id, goalText: g.text }));

    return { skill, mastery, label, indicator, trend, history, iepGoalAlignment };
  }

  private async buildSubjectGrades(
    learnerId: string,
    brainContext: BrainContext,
  ): Promise<SubjectGrade[]> {
    const subjects = Object.keys(brainContext.masteryLevels);
    const grades: SubjectGrade[] = [];

    for (const subject of subjects) {
      grades.push(await this.buildSingleSubjectGrade(learnerId, subject, brainContext));
    }

    return grades;
  }

  private async buildSingleSubjectGrade(
    learnerId: string,
    subject: string,
    brainContext: BrainContext,
  ): Promise<SubjectGrade> {
    const skillMasteries = brainContext.masteryLevels[subject] ?? {};
    const skillEntries = Object.entries(skillMasteries);

    // Load recent sessions for trend calculation
    const sessions = await this.app.db
      .select()
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          eq(learningSessions.subject, subject),
        ),
      )
      .orderBy(desc(learningSessions.createdAt))
      .limit(100);

    const skills: SkillMastery[] = skillEntries.map(([skill, level]) => {
      const mastery = level * 100;
      const { label, indicator } = this.getMasteryLabel(mastery);

      const skillSessions = sessions.filter((s) => {
        const targets = s.skillTargets as string[];
        return targets.includes(skill);
      });

      const history = skillSessions.map((s) => ({
        sessionId: s.id,
        date: s.createdAt.toISOString(),
        masteryBefore: (s.masteryBefore as Record<string, number>)?.[skill] ?? 0,
        masteryAfter: (s.masteryAfter as Record<string, number>)?.[skill] ?? 0,
        sessionType: s.sessionType,
      }));

      return {
        skill,
        mastery,
        label,
        indicator,
        trend: this.calculateTrend(history),
        attemptCount: skillSessions.length,
        lastAttemptDate: skillSessions[0]?.createdAt.toISOString() ?? null,
      };
    });

    const overallMastery = skills.length > 0
      ? skills.reduce((sum, s) => sum + s.mastery, 0) / skills.length
      : 0;
    const { label, indicator } = this.getMasteryLabel(overallMastery);

    return { subject, overallMastery, label, indicator, skills };
  }

  private calculateTrend(
    history: Array<{ masteryBefore: number; masteryAfter: number }>,
  ): "improving" | "stable" | "declining" {
    if (history.length < 2) return "stable";

    const recentDeltas = history.slice(0, 5).map((h) => h.masteryAfter - h.masteryBefore);
    const avgDelta = recentDeltas.reduce((s, d) => s + d, 0) / recentDeltas.length;

    if (avgDelta > 0.02) return "improving";
    if (avgDelta < -0.02) return "declining";
    return "stable";
  }

  private buildFunctionalMilestones(brainContext: BrainContext): FunctionalMilestone[] {
    const domains = [
      "COMMUNICATION",
      "SELF_CARE",
      "SOCIAL_EMOTIONAL",
      "PRE_ACADEMIC",
      "MOTOR_SENSORY",
    ];

    return domains.map((domain) => {
      const relevantGoals = brainContext.iepGoals.filter(
        (g) => g.domain.toUpperCase() === domain,
      );

      const progress = relevantGoals.length > 0
        ? relevantGoals.reduce((sum, _g, _i) => sum + 0.5, 0) / relevantGoals.length
        : 0;

      let status: string;
      if (progress >= 0.8) status = "ACHIEVED";
      else if (progress >= 0.5) status = "DEVELOPING";
      else if (progress > 0) status = "EMERGING";
      else status = "NOT_STARTED";

      return {
        domain,
        milestone: `${domain.toLowerCase().replace(/_/g, " ")} milestones`,
        status,
        progress: Math.round(progress * 100),
      };
    });
  }
}
