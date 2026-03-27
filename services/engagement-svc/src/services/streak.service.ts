import type { FastifyInstance } from "fastify";
import { StreakEngine } from "../engines/streak-engine.js";

export class StreakService {
  private readonly engine: StreakEngine;

  constructor(private readonly app: FastifyInstance) {
    this.engine = new StreakEngine(app);
  }

  async getStreak(learnerId: string) {
    return this.engine.getStreak(learnerId);
  }

  async recordActivity(learnerId: string) {
    return this.engine.recordActivity(learnerId);
  }

  async useStreakFreeze(learnerId: string) {
    return this.engine.useStreakFreeze(learnerId);
  }
}
