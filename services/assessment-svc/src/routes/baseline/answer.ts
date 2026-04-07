import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { assessmentItems, baselineAssessments } from "@aivo/db";
import { authenticate } from "../../middleware/authenticate.js";
import {
  shouldTerminate,
  assessmentProgress,
  type IrtState,
} from "../../engine/irt.js";
import { DOMAINS } from "../../engine/item-bank.js";
import type { BaselineQuestion } from "../../plugins/ai-client.js";
import { extractBreakConfig, shouldAdaptiveBreak, pickAdaptiveBreakType, type BreakConfig, type BreakActivityType } from "../../lib/break-config.js";

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

      // Get IRT state + current question from Redis
      const cached = await app.redis.get(`assessment:baseline:${assessment.id}`);
      if (!cached) {
        return reply.status(400).send({ error: "Assessment session expired" });
      }

      const sessionData = JSON.parse(cached) as {
        irtState: IrtState;
        functioningLevel: string;
        format: string;
        parentResponses: Record<string, unknown>;
        iepProfile: Record<string, unknown> | null;
        currentQuestion: BaselineQuestion;
        administeredHistory: { domain: string; skill: string }[];
        questionsAnswered?: number;
        consecutiveWrong?: number;
      };

      const { irtState, functioningLevel, parentResponses, iepProfile, currentQuestion, administeredHistory } = sessionData;

      // Validate the question ID matches the current question
      if (currentQuestion.id !== questionId) {
        return reply.status(400).send({ error: "Question ID mismatch" });
      }

      // Check correctness using the LLM-generated correct answer
      const isCorrect =
        answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

      // Record the response in DB
      await app.db.insert(assessmentItems).values({
        baselineAssessmentId: assessment.id,
        domain: currentQuestion.domain,
        skill: currentQuestion.skill,
        difficulty: String(currentQuestion.difficulty),
        response: { questionId, answer, isCorrect },
        isCorrect,
        responseTimeMs: 0,
        respondedAt: new Date(),
      });

      // Update IRT state manually (since items are LLM-generated, not from a fixed bank)
      const newResponse = { itemId: questionId, correct: isCorrect };
      const newResponses = [...irtState.responses, newResponse];
      const newAdministered = [...irtState.administeredItemIds, questionId];

      // Simple theta update using the question's difficulty and discrimination
      const a = currentQuestion.discrimination;
      const b = currentQuestion.difficulty;
      const p = 1 / (1 + Math.exp(-a * (irtState.theta - b)));
      const update = a * ((isCorrect ? 1 : 0) - p);
      // Step size decreases with more responses
      const stepSize = 1 / (1 + 0.1 * newResponses.length);
      let newTheta = irtState.theta + stepSize * update;
      newTheta = Math.max(-4, Math.min(4, newTheta));

      // Update domain theta
      const newDomainThetas = { ...irtState.domainThetas };
      const domainData = newDomainThetas[currentQuestion.domain] ?? { theta: irtState.theta, count: 0 };
      const domainP = 1 / (1 + Math.exp(-a * (domainData.theta - b)));
      const domainUpdate = a * ((isCorrect ? 1 : 0) - domainP);
      const domainStep = 1 / (1 + 0.1 * (domainData.count + 1));
      newDomainThetas[currentQuestion.domain] = {
        theta: Math.max(-4, Math.min(4, domainData.theta + domainStep * domainUpdate)),
        count: domainData.count + 1,
      };

      // Approximate SE: decreases with more items
      const newSE = 10 / Math.sqrt(1 + newResponses.length * 0.5);

      const newState: IrtState = {
        theta: newTheta,
        standardError: newSE,
        responses: newResponses,
        administeredItemIds: newAdministered,
        domainThetas: newDomainThetas,
      };

      // Check termination
      const isComplete = shouldTerminate(newState);
      let nextQuestion: BaselineQuestion | null = null;

      // Build the full administered history
      const updatedHistory = [
        ...(administeredHistory ?? []),
        { domain: currentQuestion.domain, skill: currentQuestion.skill },
      ];

      if (!isComplete) {
        // Determine next domain (balanced rotation)
        const domainCounts: Record<string, number> = {};
        for (const d of DOMAINS) domainCounts[d] = 0;
        for (const r of newState.responses) {
          // Find domain from administered items
          const id = r.itemId;
          // We track domain in domainThetas — find it there
          for (const d of DOMAINS) {
            if (newDomainThetas[d] && newDomainThetas[d].count > (domainCounts[d] ?? 0)) {
              domainCounts[d] = newDomainThetas[d].count;
            }
          }
        }
        // Pick domain with fewest items
        let minCount = Infinity;
        let targetDomain = DOMAINS[0];
        for (const d of DOMAINS) {
          if ((domainCounts[d] ?? 0) < minCount) {
            minCount = domainCounts[d] ?? 0;
            targetDomain = d;
          }
        }

        // Use domain-specific theta for next question targeting
        const domainTheta = newDomainThetas[targetDomain]?.theta ?? newTheta;

        // Extract auth token from request to forward to ai-svc
        const authToken =
          (request.cookies as Record<string, string>)?.access_token ??
          request.headers.authorization?.replace("Bearer ", "") ??
          "";

        // Generate next question via LLM
        nextQuestion = await app.aiClient.generateBaselineQuestion({
          parentAssessment: parentResponses,
          functioningLevel,
          assessmentMode: assessment.assessmentMode,
          theta: domainTheta,
          targetDomain,
          administeredItems: updatedHistory,
          questionNumber: newResponses.length + 1,
          iepProfile,
          authToken,
        });
      }

      // Track questions answered and consecutive wrong answers
      const questionsAnswered = (sessionData.questionsAnswered ?? 0) + 1;
      const consecutiveWrong = isCorrect ? 0 : (sessionData.consecutiveWrong ?? 0) + 1;

      // Update Redis cache with new state and next question
      await app.redis.set(
        `assessment:baseline:${assessment.id}`,
        JSON.stringify({
          irtState: newState,
          functioningLevel,
          format: sessionData.format,
          parentResponses,
          iepProfile,
          currentQuestion: nextQuestion ?? currentQuestion,
          administeredHistory: updatedHistory,
          questionsAnswered,
          consecutiveWrong,
        }),
        "EX",
        3600,
      );

      // Update assessment in DB
      await app.db
        .update(baselineAssessments)
        .set({ rawResponses: { irtState: newState, functioningLevel } })
        .where(eq(baselineAssessments.id, assessment.id));

      const progress = assessmentProgress(newState);

      // Generate feedback
      const feedback = isCorrect
        ? "Great job! That's correct."
        : `The correct answer was: ${currentQuestion.correctAnswer}`;

      // Compute break configuration and whether a break should trigger
      const breakConfig = extractBreakConfig(parentResponses);
      const isScheduledBreak =
        !isComplete && questionsAnswered > 0 && questionsAnswered % breakConfig.frequencyQuestions === 0;
      const isAdaptiveBreak =
        !isComplete && breakConfig.adaptiveBreaks && shouldAdaptiveBreak(consecutiveWrong);
      const triggerBreak = isScheduledBreak || isAdaptiveBreak;

      // Pick an appropriate break type for adaptive breaks (calming) vs scheduled
      let suggestedBreakType: BreakActivityType | undefined;
      if (isAdaptiveBreak && !isScheduledBreak) {
        suggestedBreakType = pickAdaptiveBreakType(questionsAnswered);
      }

      return reply.send({
        correct: isCorrect,
        feedback,
        nextQuestion: nextQuestion
          ? {
              id: nextQuestion.id,
              type: nextQuestion.type,
              subject: nextQuestion.domain,
              prompt: nextQuestion.prompt,
              options: nextQuestion.options,
              imageUrl: nextQuestion.imageUrl,
              difficulty: nextQuestion.difficulty,
            }
          : null,
        progress,
        isComplete: isComplete || !nextQuestion,
        breakConfig,
        shouldBreak: triggerBreak,
        suggestedBreakType,
        questionsAnswered,
        consecutiveWrong,
      });
    },
  );
}
