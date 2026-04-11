import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";
import { resilientFetch, createServiceBreaker, TIMEOUT_DEFAULTS } from "@aivo/resilience";

export interface TutorRespondParams {
  sessionId: string;
  learnerId: string;
  subject: string;
  messages: unknown[];
  brainContext: unknown;
  locale?: string;
}

export interface HomeworkOCRParams {
  learnerId?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType: string;
}

export interface HomeworkAdaptParams {
  learnerId: string;
  subject: string;
  problems: unknown[];
  brainContext: unknown;
}

export interface HomeworkAdaptFullParams {
  extractedProblems: unknown[];
  brainContext: Record<string, unknown>;
  subject: string;
}

export interface VisionExtractParams {
  fileBuffer: Buffer;
  mimeType: string;
}

export interface GenerateQuizParams {
  learnerId: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  brainContext: unknown;
}

export interface AiClient {
  tutorRespond(params: TutorRespondParams): Promise<unknown>;
  homeworkOCR(params: HomeworkOCRParams): Promise<unknown>;
  homeworkAdapt(params: HomeworkAdaptParams): Promise<unknown>;
  homeworkAdaptFull(params: HomeworkAdaptFullParams): Promise<unknown>;
  visionExtract(params: VisionExtractParams): Promise<unknown>;
  generateQuiz(params: GenerateQuizParams): Promise<unknown>;
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
    async tutorRespond(params: TutorRespondParams): Promise<unknown> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/tutor/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc tutorRespond failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });
    },

    async homeworkOCR(params: HomeworkOCRParams): Promise<unknown> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/homework/ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: params.imageUrl,
            image_base64: params.imageBase64,
          }),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc homeworkOCR failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });
    },

    async homeworkAdapt(params: HomeworkAdaptParams): Promise<unknown> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/homework/adapt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc homeworkAdapt failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });
    },

    async homeworkAdaptFull(params: HomeworkAdaptFullParams): Promise<unknown> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/homework/adapt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            extracted_problems: params.extractedProblems,
            brain_context: params.brainContext,
            subject: params.subject,
          }),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc homeworkAdaptFull failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });
    },

    async visionExtract(params: VisionExtractParams): Promise<unknown> {
      return breaker.fire(async () => {
        const formData = new FormData();
        const blob = new Blob([params.fileBuffer], { type: params.mimeType });
        formData.append("file", blob, "homework-upload");

        const res = await resilientFetch(`${baseUrl}/api/ai/vision/extract`, {
          method: "POST",
          body: formData,
          timeoutMs: TIMEOUT_DEFAULTS.AI_VISION,
        });
        if (!res.ok) {
          throw new Error(`ai-svc visionExtract failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });
    },

    async generateQuiz(params: GenerateQuizParams): Promise<unknown> {
      return breaker.fire(async () => {
        const res = await resilientFetch(`${baseUrl}/api/ai/quiz/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          timeoutMs: TIMEOUT_DEFAULTS.AI,
        });
        if (!res.ok) {
          throw new Error(`ai-svc generateQuiz failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });
    },
  };

  fastify.decorate("aiClient", aiClient);
});
