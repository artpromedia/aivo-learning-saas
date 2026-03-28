import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { baselineAssessments, learners } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { authenticate } from "../../middleware/authenticate.js";
import {
  computeDomainScores,
  type IrtState,
  type FunctioningLevel,
} from "../../engine/irt.js";

export async function baselineCompleteRoute(app: FastifyInstance) {
  app.post(
    "/assessment/baseline/:learnerId/complete",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = request.params as { learnerId: string };

      // Find the active assessment
      const [assessment] = await app.db
        .select()
        .from(baselineAssessments)
        .where(eq(baselineAssessments.learnerId, learnerId))
        .limit(1);

      if (!assessment || assessment.status !== "IN_PROGRESS") {
        return reply.status(404).send({ error: "No active assessment found" });
      }

      // Get IRT state from Redis (or fall back to DB)
      const cached = await app.redis.get(`assessment:baseline:${assessment.id}`);
      let irtState: IrtState;
      let functioningLevel: FunctioningLevel;

      if (cached) {
        const parsed = JSON.parse(cached);
        irtState = parsed.irtState;
        functioningLevel = parsed.functioningLevel ?? "STANDARD";
      } else {
        const raw = assessment.rawResponses as { irtState: IrtState; functioningLevel?: string } | null;
        if (!raw?.irtState) {
          return reply.status(400).send({ error: "Assessment state not found" });
        }
        irtState = raw.irtState;
        functioningLevel = (raw.functioningLevel as FunctioningLevel) ?? "STANDARD";
      }

      // Compute final domain scores
      const domains = computeDomainScores(irtState);

      // Get learner for IEP data
      const [learner] = await app.db
        .select()
        .from(learners)
        .where(eq(learners.id, learnerId))
        .limit(1);

      // Update assessment record
      await app.db
        .update(baselineAssessments)
        .set({
          status: "COMPLETED",
          domains,
          completedAt: new Date(),
          rawResponses: { irtState, functioningLevel },
        })
        .where(eq(baselineAssessments.id, assessment.id));

      // Clean up Redis
      await app.redis.del(`assessment:baseline:${assessment.id}`);

      // Emit baseline completed event — brain-svc subscribes to this for clone
      await publishEvent(app.nats, "assessment.baseline.completed", {
        learnerId,
        assessmentId: assessment.id,
        domains,
        functioningLevel,
        iepProfile: undefined,
      });

      app.log.info(
        { learnerId, assessmentId: assessment.id, domains, functioningLevel },
        "Baseline assessment completed",
      );

      return reply.send({
        assessmentId: assessment.id,
        domains,
        functioningLevel,
        questionsAnswered: irtState.responses.length,
        standardError: irtState.standardError,
      });
    },
  );
}
