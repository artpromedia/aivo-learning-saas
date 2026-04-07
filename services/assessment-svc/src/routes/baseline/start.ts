import type { FastifyInstance } from "fastify";
import { eq, desc, and } from "drizzle-orm";
import { baselineAssessments, parentAssessments, learners, iepDocuments } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { authenticate } from "../../middleware/authenticate.js";
import {
  createInitialState,
  getFunctioningLevelFormat,
  assessmentProgress,
  type FunctioningLevel,
} from "../../engine/irt.js";
import { DOMAINS } from "../../engine/item-bank.js";

export async function baselineStartRoute(app: FastifyInstance) {
  app.post(
    "/assessment/baseline/:learnerId/start",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = request.params as { learnerId: string };

      // Verify learner
      const [learner] = await app.db
        .select()
        .from(learners)
        .where(eq(learners.id, learnerId))
        .limit(1);

      if (!learner) {
        return reply.status(404).send({ error: "Learner not found" });
      }

      // Get functioning level from parent assessment
      const [parentAssessment] = await app.db
        .select()
        .from(parentAssessments)
        .where(eq(parentAssessments.learnerId, learnerId))
        .orderBy(desc(parentAssessments.createdAt))
        .limit(1);

      const functioningLevel: FunctioningLevel =
        (learner.functioningLevel as FunctioningLevel) ?? "STANDARD";
      const format = getFunctioningLevelFormat(functioningLevel);

      // Determine initial theta from parent assessment signals
      const signals = parentAssessment?.functioningLevelSignals as
        | { initialTheta?: number; assessmentMode?: string }
        | null;
      const initialTheta = signals?.initialTheta ?? 0;
      const assessmentMode = signals?.assessmentMode ?? "STANDARD";

      // Create IRT state
      const irtState = createInitialState(initialTheta);

      // Get the parent assessment responses as context for the LLM
      const parentResponses = (parentAssessment?.responses ?? {}) as Record<string, unknown>;

      // Query IEP data if available (parsed IEP documents for this learner)
      let iepProfile: Record<string, unknown> | null = null;
      const [iepDoc] = await app.db
        .select({ parsedData: iepDocuments.parsedData })
        .from(iepDocuments)
        .where(
          and(
            eq(iepDocuments.learnerId, learnerId),
            eq(iepDocuments.parseStatus, "PARSED"),
          ),
        )
        .orderBy(desc(iepDocuments.createdAt))
        .limit(1);

      if (iepDoc?.parsedData) {
        iepProfile = iepDoc.parsedData as Record<string, unknown>;
      }

      // Extract auth token to forward to ai-svc
      const authToken =
        (request.cookies as Record<string, string>)?.access_token ??
        request.headers.authorization?.replace("Bearer ", "") ??
        "";

      // Pick the initial target domain (balanced rotation starts with first)
      const targetDomain = DOMAINS[0];

      // Generate first question via LLM
      const firstItem = await app.aiClient.generateBaselineQuestion({
        parentAssessment: parentResponses,
        functioningLevel,
        assessmentMode,
        theta: initialTheta,
        targetDomain,
        administeredItems: [],
        questionNumber: 1,
        iepProfile,
        authToken,
      });

      // Create baseline assessment record
      const [assessment] = await app.db
        .insert(baselineAssessments)
        .values({
          learnerId,
          assessmentMode: assessmentMode as "STANDARD" | "MODIFIED" | "PICTURE_BASED" | "SWITCH_SCAN" | "EYE_GAZE" | "PARTNER_ASSISTED" | "OBSERVATIONAL",
          status: "IN_PROGRESS",
          rawResponses: { irtState, functioningLevel, format, parentResponses },
        })
        .returning();

      // Cache IRT state and generated question in Redis for fast access
      await app.redis.set(
        `assessment:baseline:${assessment.id}`,
        JSON.stringify({
          irtState,
          functioningLevel,
          format,
          parentResponses,
          iepProfile,
          currentQuestion: firstItem,
          administeredHistory: [] as { domain: string; skill: string }[],
        }),
        "EX",
        3600, // 1 hour TTL
      );

      // Emit started event
      await publishEvent(app.nats, "assessment.baseline.started", {
        learnerId,
        assessmentMode: assessmentMode as "STANDARD" | "MODIFIED" | "PICTURE_BASED" | "SWITCH_SCAN" | "EYE_GAZE" | "PARTNER_ASSISTED" | "OBSERVATIONAL",
      });

      app.log.info({ learnerId, assessmentId: assessment.id, mode: assessmentMode }, "Baseline assessment started");

      // Extract break preferences from parent assessment responses
      const breakConfig = buildBreakConfig(parentResponses);

      return reply.status(201).send({
        assessmentId: assessment.id,
        question: {
          id: firstItem.id,
          type: firstItem.type,
          subject: firstItem.domain,
          prompt: firstItem.prompt,
          options: firstItem.options,
          imageUrl: firstItem.imageUrl,
          difficulty: firstItem.difficulty,
        },
        progress: assessmentProgress(irtState),
        breakConfig,
      });
    },
  );
}

type EngagementBreakType = "music" | "puzzle" | "game";

function mapBreakFrequency(parentResponses: Record<string, unknown>): number {
  const answer = parentResponses["sn-2"] as string | undefined;
  if (!answer) return 8;
  if (answer.startsWith("20+")) return 15;
  if (answer.startsWith("10-20")) return 10;
  if (answer.startsWith("5-10")) return 8;
  if (answer.startsWith("3-5")) return 4;
  if (answer.startsWith("1-2")) return 2;
  if (answer.includes("frequent")) return 1;
  return 8;
}

function mapBreakTypes(parentResponses: Record<string, unknown>): EngagementBreakType[] {
  const answer = parentResponses["sn-3"];
  const selections: string[] = Array.isArray(answer) ? answer : typeof answer === "string" ? [answer] : [];

  if (selections.length === 0) return ["music", "puzzle", "game"];

  const types: EngagementBreakType[] = [];
  for (const sel of selections) {
    if (sel.includes("calming music") || sel.includes("Sensory")) types.push("music");
    if (sel.includes("simple games") || sel.includes("activity break") || sel.includes("Preferred activity")) types.push("game");
    if (sel.includes("Puzzle") || sel.includes("brain teaser")) types.push("puzzle");
  }

  return types.length > 0 ? [...new Set(types)] : ["music", "puzzle", "game"];
}

function buildBreakConfig(parentResponses: Record<string, unknown>): {
  frequencyQuestions: number;
  preferredTypes: EngagementBreakType[];
} {
  return {
    frequencyQuestions: mapBreakFrequency(parentResponses),
    preferredTypes: mapBreakTypes(parentResponses),
  };
}
