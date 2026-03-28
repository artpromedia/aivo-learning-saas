import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface IepParseResult {
  goals: { area: string; description: string }[];
  accommodations: string[];
  services: string[];
  strengths: string[];
  concerns: string[];
  recommendedFunctioningLevel?: string;
  communicationSystem?: string;
  assistiveTechnology?: string[];
  gradeLevel?: string;
}

export interface AiClient {
  parseIep(fileUrl: string, fileType: string): Promise<IepParseResult>;
}

declare module "fastify" {
  interface FastifyInstance {
    aiClient: AiClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const baseUrl = config.AI_SVC_URL;

  const aiClient: AiClient = {
    async parseIep(fileUrl: string, fileType: string): Promise<IepParseResult> {
      const res = await fetch(`${baseUrl}/api/ai/iep/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, fileType }),
      });
      if (!res.ok) {
        throw new Error(`ai-svc IEP parse failed: ${res.status} ${res.statusText}`);
      }
      return res.json() as Promise<IepParseResult>;
    },
  };

  fastify.decorate("aiClient", aiClient);
});
