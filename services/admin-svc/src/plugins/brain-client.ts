import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";
import { resilientFetch, createServiceBreaker, TIMEOUT_DEFAULTS } from "@aivo/resilience";

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
  const breaker = createServiceBreaker("brain-svc", { timeout: TIMEOUT_DEFAULTS.BRAIN });

  const brainClient: BrainClient = {
    async upgradeBrains(brainStateIds: string[], targetVersion: string) {
      return breaker.fire(async () => {
        const response = await resilientFetch(`${baseUrl}/internal/brains/upgrade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brainStateIds, targetVersion }),
          timeoutMs: TIMEOUT_DEFAULTS.BRAIN,
        });
        if (!response.ok) {
          throw new Error(`brain-svc upgrade failed: ${response.status}`);
        }
        return response.json() as Promise<{ upgraded: number; failed: number }>;
      });
    },

    async rollbackBrains(brainVersionId: string) {
      return breaker.fire(async () => {
        const response = await resilientFetch(`${baseUrl}/internal/brains/rollback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brainVersionId }),
          timeoutMs: TIMEOUT_DEFAULTS.BRAIN,
        });
        if (!response.ok) {
          throw new Error(`brain-svc rollback failed: ${response.status}`);
        }
        return response.json() as Promise<{ rolledBack: number }>;
      });
    },

    async getBrainHealth(brainStateId: string) {
      return breaker.fire(async () => {
        const response = await resilientFetch(`${baseUrl}/internal/brains/${brainStateId}/health`, {
          timeoutMs: TIMEOUT_DEFAULTS.BRAIN,
        });
        if (!response.ok) {
          throw new Error(`brain-svc health check failed: ${response.status}`);
        }
        return response.json() as Promise<{ masteryScores: Record<string, number> }>;
      });
    },
  };

  fastify.decorate("brainClient", brainClient);
});
