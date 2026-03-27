import type { FastifyInstance } from "fastify";
import { BadgeEngine } from "../engines/badge-engine.js";
import { BADGE_DEFINITIONS } from "../data/badge-definitions.js";

export class BadgeService {
  private readonly engine: BadgeEngine;

  constructor(private readonly app: FastifyInstance) {
    this.engine = new BadgeEngine(app);
  }

  async getEarnedBadges(learnerId: string) {
    return this.engine.getEarnedBadges(learnerId);
  }

  async getAvailableBadges() {
    return BADGE_DEFINITIONS.map((def) => ({
      slug: def.slug,
      name: def.name,
      description: def.description,
      category: def.category,
      iconUrl: def.iconUrl,
    }));
  }

  async getBadgeProgress(learnerId: string) {
    return this.engine.getBadgeProgress(learnerId);
  }

  async evaluateAndAward(learnerId: string, triggerEvent?: string) {
    return this.engine.evaluateAllBadges(learnerId, triggerEvent);
  }
}
