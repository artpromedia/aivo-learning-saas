import type { FastifyInstance } from "fastify";

export class BrainProfileService {
  constructor(private readonly app: FastifyInstance) {}

  async getProfile(learnerId: string) {
    const context = await this.app.brainClient.getContext(learnerId);

    return {
      learnerId,
      version: context.mainBrainVersion,
      functioningLevel: context.functioningLevel,
      communicationMode: context.communicationMode,
      enrolledGrade: context.enrolledGrade,
      preferredModality: context.preferredModality,
      attentionSpanMinutes: context.attentionSpanMinutes,
      cognitiveLoad: context.cognitiveLoad,
      lastUpdated: context.lastUpdated,
      masteryOverview: this.summarizeMastery(context.masteryLevels),
    };
  }

  async getFunctioningLevel(learnerId: string) {
    const context = await this.app.brainClient.getContext(learnerId);
    const history = await this.app.brainClient.getFunctioningLevelHistory(learnerId);

    return {
      current: context.functioningLevel,
      history,
    };
  }

  async getAccommodations(learnerId: string) {
    const accommodations = await this.app.brainClient.getAccommodations(learnerId);
    return { accommodations };
  }

  async getVersions(learnerId: string) {
    const snapshots = await this.app.brainClient.getSnapshots(learnerId);
    return {
      versions: snapshots.map((s) => ({
        id: s.id,
        trigger: s.trigger,
        versionNumber: s.versionNumber,
        createdAt: s.createdAt,
      })),
    };
  }

  private summarizeMastery(masteryLevels: Record<string, Record<string, number>>): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const [subject, skills] of Object.entries(masteryLevels)) {
      const values = Object.values(skills);
      if (values.length === 0) {
        summary[subject] = 0;
      } else {
        summary[subject] = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100;
      }
    }
    return summary;
  }
}
