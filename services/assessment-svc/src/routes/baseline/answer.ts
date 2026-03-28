import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { assessmentItems, baselineAssessments } from "@aivo/db";
import { authenticate } from "../../middleware/authenticate.js";
import {
  processResponse,
  selectNextItemBalanced,
  shouldTerminate,
  assessmentProgress,
  type IrtState,
  type FunctioningLevelFormat,
} from "../../engine/irt.js";
import { getItemsForFunctioningLevel, DOMAINS, ITEM_BANK } from "../../engine/item-bank.js";

const bodySchema = z.object({
  questionId: z.string(),
  answer: z.string(),
});

export async function baselineAnswerRoute(app: FastifyInstance) {
  app.post(
    "/assessment/baseline/:learnerId/answer",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = request.params as { learnerId: string };
      const { questionId, answer } = bodySchema.parse(request.body);

      // Find the active assessment for this learner
      const [assessment] = await app.db
        .select()
        .from(baselineAssessments)
        .where(eq(baselineAssessments.learnerId, learnerId))
        .limit(1);

      if (!assessment || assessment.status !== "IN_PROGRESS") {
        return reply.status(404).send({ error: "No active assessment found" });
      }

      // Get IRT state from Redis
      const cached = await app.redis.get(`assessment:baseline:${assessment.id}`);
      if (!cached) {
        return reply.status(400).send({ error: "Assessment session expired" });
      }

      const { irtState, format } = JSON.parse(cached) as {
        irtState: IrtState;
        functioningLevel: string;
        format: FunctioningLevelFormat;
      };

      // Find the item in the bank
      const item = ITEM_BANK.find((i) => i.id === questionId);
      if (!item) {
        return reply.status(400).send({ error: "Invalid question ID" });
      }

      // Check if the answer is correct
      const isCorrect = answer.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();

      // Record the response
      const responseTimeMs = Date.now(); // Could be provided by client
      await app.db.insert(assessmentItems).values({
        baselineAssessmentId: assessment.id,
        domain: item.domain,
        skill: item.skill,
        difficulty: String(item.difficulty),
        response: { questionId, answer, isCorrect },
        isCorrect,
        responseTimeMs: 0,
        respondedAt: new Date(),
      });

      // Update IRT state
      const availableItems = getItemsForFunctioningLevel(format);
      const newState = processResponse(irtState, availableItems, {
        itemId: questionId,
        correct: isCorrect,
        responseTimeMs,
      });

      // Check termination
      const isComplete = shouldTerminate(newState);
      let nextQuestion = null;

      if (!isComplete) {
        const nextItem = selectNextItemBalanced(newState, availableItems, [...DOMAINS]);
        if (nextItem) {
          nextQuestion = {
            id: nextItem.id,
            type: nextItem.type,
            subject: nextItem.domain,
            prompt: nextItem.prompt,
            options: nextItem.options,
            imageUrl: nextItem.imageUrl,
            difficulty: nextItem.difficulty,
          };
        }
      }

      // Update Redis cache
      await app.redis.set(
        `assessment:baseline:${assessment.id}`,
        JSON.stringify({ irtState: newState, functioningLevel: format, format }),
        "EX",
        3600,
      );

      // Update assessment in DB (raw responses for recovery)
      await app.db
        .update(baselineAssessments)
        .set({ rawResponses: { irtState: newState, format } })
        .where(eq(baselineAssessments.id, assessment.id));

      const progress = assessmentProgress(newState);

      // Generate simple feedback
      const feedback = isCorrect
        ? "Great job! That's correct."
        : `The correct answer was: ${item.correctAnswer}`;

      return reply.send({
        correct: isCorrect,
        feedback,
        nextQuestion,
        progress,
        isComplete: isComplete || !nextQuestion,
      });
    },
  );
}
