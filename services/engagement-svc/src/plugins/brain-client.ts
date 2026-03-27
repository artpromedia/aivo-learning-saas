import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface BrainEngagementProfile {
  learnerId: string;
  functioningLevel: string;
  communicationMode: string;
  attentionSpanMinutes: number;
  preferredModality: string;
  masteryLevels: Record<string, Record<string, number>>;
  iepGoals: Array<{ id: string; text: string; domain: string }>;
}

export interface BrainClient {
  getEngagementProfile(learnerId: string): Promise<BrainEngagementProfile>;
}

declare module "fastify" {
  interface FastifyInstance {
    brainClient: BrainClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const baseUrl = config.BRAIN_SVC_URL;

  const brainClient: BrainClient = {
    async getEngagementProfile(learnerId: string): Promise<BrainEngagementProfile> {
      const res = await fetch(`${baseUrl}/api/brain/${learnerId}/context`);
      if (!res.ok) {
        throw new Error(`brain-svc getEngagementProfile failed: ${res.status} ${res.statusText}`);
      }
      return res.json() as Promise<BrainEngagementProfile>;
    },
  };

  fastify.decorate("brainClient", brainClient);
});
