import type { FastifyInstance } from "fastify";
import { XpEngine } from "../engines/xp-engine.js";

export type GamificationMode =
  | "full"
  | "full_simplified"
  | "celebration_first"
  | "cause_and_effect"
  | "parent_facing_only";

export function getGamificationMode(functioningLevel: string): GamificationMode {
  switch (functioningLevel) {
    case "STANDARD": return "full";
    case "SUPPORTED": return "full_simplified";
    case "LOW_VERBAL": return "celebration_first";
    case "NON_VERBAL": return "cause_and_effect";
    case "PRE_SYMBOLIC": return "parent_facing_only";
    default: return "full";
  }
}

export class XpService {
  private readonly engine: XpEngine;

  constructor(private readonly app: FastifyInstance) {
    this.engine = new XpEngine(app);
  }

  async getSummary(learnerId: string) {
    const summary = await this.engine.getXpSummary(learnerId);

    let functioningLevel = "STANDARD";
    try {
      const profile = await this.app.brainClient.getEngagementProfile(learnerId);
      functioningLevel = profile.functioningLevel;
    } catch {
      // Default to STANDARD if brain-svc unavailable
    }

    const gamificationMode = getGamificationMode(functioningLevel);

    // For parent_facing_only, return milestone-focused data
    if (gamificationMode === "parent_facing_only") {
      return {
        gamificationMode,
        milestones: {
          totalActivities: summary.totalXp > 0 ? Math.floor(summary.totalXp / 10) : 0,
          currentStreakDays: summary.currentStreakDays,
          longestStreakDays: summary.longestStreakDays,
        },
      };
    }

    // For celebration_first, convert XP to stars
    if (gamificationMode === "celebration_first") {
      return {
        gamificationMode,
        stars: Math.floor(summary.totalXp / 10),
        level: summary.level,
        currentStreakDays: summary.currentStreakDays,
        sensoryFriendly: true,
      };
    }

    return {
      gamificationMode,
      ...summary,
    };
  }

  async getHistory(learnerId: string, limit = 50, offset = 0) {
    return this.engine.getXpHistory(learnerId, limit, offset);
  }
}
