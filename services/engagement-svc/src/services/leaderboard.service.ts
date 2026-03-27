import type { FastifyInstance } from "fastify";
import { LeaderboardEngine } from "../engines/leaderboard-engine.js";

export class LeaderboardService {
  private readonly engine: LeaderboardEngine;

  constructor(private readonly app: FastifyInstance) {
    this.engine = new LeaderboardEngine(app);
  }

  async getGlobal(limit = 20, offset = 0) {
    return this.engine.getGlobalLeaderboard(limit, offset);
  }

  async getClassroom(classroomId: string, limit = 20, offset = 0) {
    return this.engine.getClassroomLeaderboard(classroomId, limit, offset);
  }

  async getFriends(learnerId: string, limit = 20) {
    return this.engine.getFriendsLeaderboard(learnerId, limit);
  }

  async addXp(learnerId: string, xpAmount: number, classroomIds: string[] = []) {
    return this.engine.addXpToLeaderboards(learnerId, xpAmount, classroomIds);
  }
}
