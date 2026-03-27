import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface BrainClient {
  upgradeBrains(brainStateIds: string[], targetVersion: string): Promise<{ upgraded: number; failed: number }>;
  rollbackBrains(brainVersionId: string): Promise<{ rolledBack: number }>;
  getBrainHealth(brainStateId: string): Promise<{ masteryScores: Record<string, number> }>;
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
    async upgradeBrains(brainStateIds: string[], targetVersion: string) {
      const response = await fetch(`${baseUrl}/internal/brains/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brainStateIds, targetVersion }),
      });

      if (!response.ok) {
        throw new Error(`brain-svc upgrade failed: ${response.status}`);
      }

      return response.json() as Promise<{ upgraded: number; failed: number }>;
    },

    async rollbackBrains(brainVersionId: string) {
      const response = await fetch(`${baseUrl}/internal/brains/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brainVersionId }),
      });

      if (!response.ok) {
        throw new Error(`brain-svc rollback failed: ${response.status}`);
      }

      return response.json() as Promise<{ rolledBack: number }>;
    },

    async getBrainHealth(brainStateId: string) {
      const response = await fetch(`${baseUrl}/internal/brains/${brainStateId}/health`);

      if (!response.ok) {
        throw new Error(`brain-svc health check failed: ${response.status}`);
      }

      return response.json() as Promise<{ masteryScores: Record<string, number> }>;
    },
  };

  fastify.decorate("brainClient", brainClient);
});
