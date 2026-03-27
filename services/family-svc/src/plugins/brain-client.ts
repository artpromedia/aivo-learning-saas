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
  iepGoals: Array<{ id: string; text: string; domain: string }>;
  attentionSpanMinutes: number;
  preferredModality: string;
  cognitiveLoad: string;
  mainBrainVersion: string;
  lastUpdated: string;
}

export interface BrainSnapshot {
  id: string;
  trigger: string;
  versionNumber: number;
  createdAt: string;
}

export interface BrainClient {
  getContext(learnerId: string): Promise<BrainContext>;
  applyRecommendation(learnerId: string, recommendationId: string, payload: unknown): Promise<{ snapshotId: string }>;
  declineRecommendation(learnerId: string, recommendationId: string): Promise<void>;
  addInsight(learnerId: string, insight: { text: string; attribution: string; userId: string }): Promise<void>;
  getSnapshots(learnerId: string): Promise<BrainSnapshot[]>;
  getFunctioningLevelHistory(learnerId: string): Promise<Array<{ level: string; setAt: string; trigger: string }>>;
  getAccommodations(learnerId: string): Promise<string[]>;
  exportFullState(learnerId: string): Promise<Record<string, unknown>>;
}

declare module "fastify" {
  interface FastifyInstance {
    brainClient: BrainClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const baseUrl = config.BRAIN_SVC_URL;

  async function jsonFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`brain-svc ${options?.method ?? "GET"} ${url} failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  const brainClient: BrainClient = {
    async getContext(learnerId) {
      return jsonFetch<BrainContext>(`${baseUrl}/api/brain/${learnerId}/context`);
    },
    async applyRecommendation(learnerId, recommendationId, payload) {
      return jsonFetch<{ snapshotId: string }>(`${baseUrl}/api/brain/${learnerId}/recommendations/${recommendationId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
    },
    async declineRecommendation(learnerId, recommendationId) {
      await jsonFetch(`${baseUrl}/api/brain/${learnerId}/recommendations/${recommendationId}/decline`, {
        method: "POST",
      });
    },
    async addInsight(learnerId, insight) {
      await jsonFetch(`${baseUrl}/api/brain/${learnerId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(insight),
      });
    },
    async getSnapshots(learnerId) {
      return jsonFetch<BrainSnapshot[]>(`${baseUrl}/api/brain/${learnerId}/snapshots`);
    },
    async getFunctioningLevelHistory(learnerId) {
      return jsonFetch<Array<{ level: string; setAt: string; trigger: string }>>(`${baseUrl}/api/brain/${learnerId}/functioning-level/history`);
    },
    async getAccommodations(learnerId) {
      return jsonFetch<string[]>(`${baseUrl}/api/brain/${learnerId}/accommodations`);
    },
    async exportFullState(learnerId) {
      return jsonFetch<Record<string, unknown>>(`${baseUrl}/api/brain/${learnerId}/export`);
    },
  };

  fastify.decorate("brainClient", brainClient);
});
