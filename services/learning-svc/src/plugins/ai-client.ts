import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";
import { resilientFetch, createServiceBreaker, TIMEOUT_DEFAULTS } from "@aivo/resilience";
import type { BrainContext } from "./brain-client.js";

export interface GenerateContentParams {
  learnerId: string;
  subject: string;
  skill: string;
  sessionType: string;
  brainContext: BrainContext;
  difficulty?: string;
}

export interface GeneratedContent {
  title: string;
  sections: Array<{
    type: string;
    content: string;
    instructions?: string;
  }>;
  questions?: Array<{
    id: string;
    prompt: string;
    type: string;
    options?: string[];
    correctAnswer: string;
    hint?: string;
    difficulty: number;
  }>;
  estimatedDurationMinutes: number;
}

export interface GenerateQuestChapterParams {
  learnerId: string;
  questSlug: string;
  chapterNumber: number;
  subject: string;
  skills: string[];
  tutorPersona: string;
  narrativeContext: string;
  brainContext: BrainContext;
}

export interface GeneratedChapterContent {
  narrative: string;
  activities: Array<{
    id: string;
    type: string;
    prompt: string;
    options?: string[];
    correctAnswer: string;
    skill: string;
    difficulty: number;
  }>;
  bossQuestions?: Array<{
    id: string;
    prompt: string;
    type: string;
    options?: string[];
    correctAnswer: string;
    skill: string;
    difficulty: number;
    visualAid?: string;
  }>;
}

export interface AiClient {
  generateContent(params: GenerateContentParams): Promise<GeneratedContent>;
  generateQuestChapter(params: GenerateQuestChapterParams): Promise<GeneratedChapterContent>;
  generateBossAssessment(params: {
    learnerId: string;
    subject: string;
    skills: string[];
    functioningLevel: string;
    questionCount: number;
    brainContext: BrainContext;
    narrativeTheme: string;
  }): Promise<GeneratedChapterContent>;
}

declare module "fastify" {
  interface FastifyInstance {
    aiClient: AiClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const baseUrl = config.AI_SVC_URL;
  const breaker = createServiceBreaker("ai-svc", { timeout: TIMEOUT_DEFAULTS.AI });

  const aiClient: AiClient = {
    async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc generateContent failed: ${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<GeneratedContent>;
      });
    },

    async generateQuestChapter(params: GenerateQuestChapterParams): Promise<GeneratedChapterContent> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/quest/chapter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc generateQuestChapter failed: ${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<GeneratedChapterContent>;
      });
    },

    async generateBossAssessment(params): Promise<GeneratedChapterContent> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/quest/boss`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc generateBossAssessment failed: ${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<GeneratedChapterContent>;
      });
    },
  };

  fastify.decorate("aiClient", aiClient);
});
