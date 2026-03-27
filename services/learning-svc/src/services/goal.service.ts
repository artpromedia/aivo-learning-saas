import type { FastifyInstance } from "fastify";

export interface LearningGoal {
  id: string;
  learnerId: string;
  title: string;
  description: string;
  targetSubject: string;
  targetSkill: string | null;
  targetMastery: number;
  currentMastery: number;
  createdBy: string;
  status: "active" | "completed" | "paused";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const REDIS_GOALS_PREFIX = "goals:";

export class GoalService {
  constructor(private readonly app: FastifyInstance) {}

  async listGoals(learnerId: string): Promise<LearningGoal[]> {
    const raw = await this.app.redis.get(`${REDIS_GOALS_PREFIX}${learnerId}`);
    if (!raw) return [];
    return JSON.parse(raw) as LearningGoal[];
  }

  async createGoal(params: {
    learnerId: string;
    title: string;
    description: string;
    targetSubject: string;
    targetSkill?: string;
    targetMastery: number;
    createdBy: string;
    dueDate?: string;
  }): Promise<LearningGoal> {
    const goals = await this.listGoals(params.learnerId);

    // Get current mastery from brain
    const brainContext = await this.app.brainClient.getBrainContext(params.learnerId);
    const currentMastery = params.targetSkill
      ? (brainContext.masteryLevels[params.targetSubject]?.[params.targetSkill] ?? 0)
      : 0;

    const goal: LearningGoal = {
      id: crypto.randomUUID(),
      learnerId: params.learnerId,
      title: params.title,
      description: params.description,
      targetSubject: params.targetSubject,
      targetSkill: params.targetSkill ?? null,
      targetMastery: params.targetMastery,
      currentMastery,
      createdBy: params.createdBy,
      status: "active",
      dueDate: params.dueDate ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    goals.push(goal);
    await this.saveGoals(params.learnerId, goals);

    return goal;
  }

  async updateGoal(
    goalId: string,
    learnerId: string,
    updates: Partial<Pick<LearningGoal, "title" | "description" | "status" | "targetMastery" | "dueDate">>,
  ): Promise<LearningGoal | null> {
    const goals = await this.listGoals(learnerId);
    const idx = goals.findIndex((g) => g.id === goalId);
    if (idx === -1) return null;

    goals[idx] = {
      ...goals[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveGoals(learnerId, goals);
    return goals[idx];
  }

  async refreshMastery(learnerId: string): Promise<void> {
    const goals = await this.listGoals(learnerId);
    if (goals.length === 0) return;

    const brainContext = await this.app.brainClient.getBrainContext(learnerId);

    for (const goal of goals) {
      if (goal.status !== "active") continue;

      if (goal.targetSkill) {
        goal.currentMastery =
          brainContext.masteryLevels[goal.targetSubject]?.[goal.targetSkill] ?? 0;
      }

      if (goal.currentMastery >= goal.targetMastery) {
        goal.status = "completed";
      }

      goal.updatedAt = new Date().toISOString();
    }

    await this.saveGoals(learnerId, goals);
  }

  private async saveGoals(learnerId: string, goals: LearningGoal[]): Promise<void> {
    await this.app.redis.set(
      `${REDIS_GOALS_PREFIX}${learnerId}`,
      JSON.stringify(goals),
    );
  }
}
