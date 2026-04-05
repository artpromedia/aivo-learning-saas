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

export interface BaselineQuestion {
  id: string;
  domain: string;
  skill: string;
  difficulty: number;
  discrimination: number;
  prompt: string;
  type: "multiple_choice" | "drag_drop" | "fill_blank" | "matching";
  options: string[];
  correctAnswer: string;
  imageUrl?: string | null;
}

export interface AiClient {
  parseIep(fileUrl: string, fileType: string): Promise<IepParseResult>;
  generateBaselineQuestion(params: {
    parentAssessment: Record<string, unknown>;
    functioningLevel: string;
    assessmentMode: string;
    theta: number;
    targetDomain: string;
    administeredItems?: { domain: string; skill: string }[];
    questionNumber?: number;
    iepProfile?: Record<string, unknown> | null;
    authToken: string;
  }): Promise<BaselineQuestion>;
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

    async generateBaselineQuestion(params): Promise<BaselineQuestion> {
      const res = await fetch(`${baseUrl}/api/ai/baseline/generate-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.authToken}`,
        },
        body: JSON.stringify({
          parent_assessment: params.parentAssessment,
          functioning_level: params.functioningLevel,
          assessment_mode: params.assessmentMode,
          theta: params.theta,
          target_domain: params.targetDomain,
          administered_items: params.administeredItems ?? [],
          question_number: params.questionNumber ?? 1,
          iep_profile: params.iepProfile ?? null,
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`ai-svc baseline generation failed: ${res.status} ${errText}`);
      }
      const data = (await res.json()) as { question: BaselineQuestion };
      return data.question;
    },
  };

  fastify.decorate("aiClient", aiClient);
});
