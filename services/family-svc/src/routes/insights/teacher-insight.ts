import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { InsightService } from "../../services/insight.service.js";
import { recommendations, brainStates } from "@aivo/db";
import { publishEvent } from "@aivo/events";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({ text: z.string().min(1).max(4096) });

export async function teacherInsightRecommendationRoute(app: FastifyInstance) {
  app.post(
    "/family/learners/:learnerId/teacher-insights",
    { preHandler: [authenticate, requireLearnerAccess("teacher")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { text } = bodySchema.parse(request.body);

      // Submit insight via existing service
      const insightService = new InsightService(app);
      const insight = await insightService.submitInsight(
        learnerId,
        request.user.sub,
        text,
        "teacher",
      );

      // Get brain state for the learner
      const [brainState] = await app.db
        .select()
        .from(brainStates)
        .where(eq(brainStates.learnerId, learnerId))
        .limit(1);

      if (!brainState) {
        return reply.status(201).send({
          insight,
          recommendation: null,
          message: "Insight saved but no active brain state found for recommendation",
        });
      }

      // Create a recommendation for the parent
      const [recommendation] = await app.db
        .insert(recommendations)
        .values({
          brainStateId: brainState.id,
          learnerId,
          type: "TEACHER_INSIGHT",
          title: "Teacher observation shared",
          description: text,
          payload: {
            teacherId: request.user.sub,
            teacherEmail: request.user.email,
            insightText: text,
            insightId: insight.id,
          },
          status: "PENDING",
        })
        .returning();

      // Publish event for comms-svc to send notification
      await publishEvent(app.nats, "brain.recommendation.created", {
        learnerId,
        recommendationId: recommendation.id,
        type: "TEACHER_INSIGHT",
        teacherId: request.user.sub,
      });

      return reply.status(201).send({
        insight,
        recommendation: {
          id: recommendation.id,
          type: recommendation.type,
          status: recommendation.status,
        },
      });
    },
  );
}
