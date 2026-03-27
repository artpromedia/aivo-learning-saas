import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface BrainContext {
  learnerId: string;
  enrolledGrade: number | null;
  functioningLevel: string;
  communicationMode: string;
  deliveryLevels: Record<string, string>;
  accommodations: string[];
  masteryLevels: Record<string, Record<string, number>>;
  masteryGaps: Array<{ subject: string; skill: string; level: number }>;
  iepGoals: Array<{ id: string; text: string; domain: string; targetDate: string }>;
  attentionSpanMinutes: number;
  preferredModality: string;
  cognitiveLoad: string;
  activeTutors: Array<{ tutorId: string; subject: string }>;
}

export interface BrainClient {
  getBrainContext(learnerId: string): Promise<BrainContext>;
  updateMastery(learnerId: string, subject: string, skill: string, delta: number): Promise<void>;
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
    async getBrainContext(learnerId: string): Promise<BrainContext> {
      const res = await fetch(`${baseUrl}/api/brain/${learnerId}/context`);
      if (!res.ok) {
        throw new Error(`brain-svc getBrainContext failed: ${res.status} ${res.statusText}`);
      }
      return res.json() as Promise<BrainContext>;
    },

    async updateMastery(learnerId: string, subject: string, skill: string, delta: number): Promise<void> {
      const res = await fetch(`${baseUrl}/api/brain/${learnerId}/mastery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, skill, delta }),
      });
      if (!res.ok) {
        throw new Error(`brain-svc updateMastery failed: ${res.status} ${res.statusText}`);
      }
    },
  };

  fastify.decorate("brainClient", brainClient);
});
