import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { parentAssessments, learners } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { authenticate } from "../../middleware/authenticate.js";
import { scoreFunctioningLevel, extractInsightNotes } from "../../services/functioning-level.service.js";
import { validateResponses } from "../../lib/parent-assessment-questions.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
});

export async function parentAssessmentRoute(app: FastifyInstance) {
  app.post(
    "/assessment/parent",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId, answers } = bodySchema.parse(request.body);
      const parentId = request.user.sub;

      // Verify learner exists and belongs to this user's tenant
      const [learner] = await app.db
        .select()
        .from(learners)
        .where(eq(learners.id, learnerId))
        .limit(1);

      if (!learner) {
        return reply.status(404).send({ error: "Learner not found" });
      }

      // Validate required questions
      const validation = validateResponses(answers);
      if (!validation.valid) {
        return reply.status(400).send({
          error: "Missing required questions",
          details: validation.errors,
        });
      }

      // Score the functioning level and routing
      const signals = scoreFunctioningLevel(answers as Record<string, unknown>);

      // Extract insight notes
      const insights = extractInsightNotes(answers as Record<string, unknown>);

      // Store the parent assessment
      const [assessment] = await app.db
        .insert(parentAssessments)
        .values({
          learnerId,
          parentId,
          responses: answers,
          functioningLevelSignals: signals,
          assessmentType: signals.assessmentType,
          supportLevel: signals.supportLevel,
          hasExistingIep: signals.hasExistingIep,
          hasExisting504: signals.hasExisting504,
          learningStyleNotes: insights.learningStyleNotes || null,
          strengthsNotes: insights.strengthsNotes || null,
          challengesNotes: insights.challengesNotes || null,
          behaviorNotes: insights.behaviorNotes || null,
          completedAt: new Date(),
        })
        .returning();

      // Update learner's functioning level
      await app.db
        .update(learners)
        .set({ functioningLevel: signals.overallLevel })
        .where(eq(learners.id, learnerId));

      // Emit NATS event
      await publishEvent(app.nats, "assessment.parent.completed", {
        learnerId,
        parentId,
        assessmentType: signals.assessmentType,
        supportLevel: signals.supportLevel,
        responses: answers,
        functioningLevelSignals: signals,
      });

      app.log.info(
        { learnerId, level: signals.overallLevel, type: signals.assessmentType },
        "Parent assessment completed",
      );

      return reply.status(201).send({
        id: assessment.id,
        functioningLevel: signals.overallLevel,
        assessmentMode: signals.assessmentMode,
        assessmentType: signals.assessmentType,
        supportLevel: signals.supportLevel,
        signals,
      });
    },
  );
}
