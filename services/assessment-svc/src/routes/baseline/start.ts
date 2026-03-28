import type { FastifyInstance } from "fastify";
import { eq, desc } from "drizzle-orm";
import { baselineAssessments, parentAssessments, learners } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { authenticate } from "../../middleware/authenticate.js";
import {
  createInitialState,
  selectNextItemBalanced,
  getFunctioningLevelFormat,
  assessmentProgress,
  type FunctioningLevel,
  type IrtState,
} from "../../engine/irt.js";
import { getItemsForFunctioningLevel, DOMAINS } from "../../engine/item-bank.js";

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

      // Get items filtered by functioning level
      const availableItems = getItemsForFunctioningLevel(format);

      // Select first question
      const firstItem = selectNextItemBalanced(irtState, availableItems, [...DOMAINS]);

      if (!firstItem) {
        return reply.status(500).send({ error: "No assessment items available" });
      }

      // Create baseline assessment record
      const [assessment] = await app.db
        .insert(baselineAssessments)
        .values({
          learnerId,
          assessmentMode: assessmentMode as "STANDARD" | "MODIFIED" | "PICTURE_BASED" | "SWITCH_SCAN" | "EYE_GAZE" | "PARTNER_ASSISTED" | "OBSERVATIONAL",
          status: "IN_PROGRESS",
          rawResponses: { irtState, functioningLevel, format },
        })
        .returning();

      // Cache IRT state in Redis for fast access during assessment
      await app.redis.set(
        `assessment:baseline:${assessment.id}`,
        JSON.stringify({ irtState, functioningLevel, format }),
        "EX",
        3600, // 1 hour TTL
      );

      // Emit started event
      await publishEvent(app.nats, "assessment.baseline.started", {
        learnerId,
        assessmentMode: assessmentMode as "STANDARD" | "MODIFIED" | "PICTURE_BASED" | "SWITCH_SCAN" | "EYE_GAZE" | "PARTNER_ASSISTED" | "OBSERVATIONAL",
      });

      app.log.info({ learnerId, assessmentId: assessment.id, mode: assessmentMode }, "Baseline assessment started");

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
      });
    },
  );
}
