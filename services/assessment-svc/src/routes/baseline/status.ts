import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { baselineAssessments, assessmentItems } from "@aivo/db";
import { authenticate } from "../../middleware/authenticate.js";
import { assessmentProgress, type IrtState } from "../../engine/irt.js";

export async function baselineStatusRoute(app: FastifyInstance) {
  app.get(
    "/assessment/baseline/:learnerId/status",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = request.params as { learnerId: string };

      const [assessment] = await app.db
        .select()
        .from(baselineAssessments)
        .where(eq(baselineAssessments.learnerId, learnerId))
        .limit(1);

      if (!assessment) {
        return reply.status(404).send({ error: "No assessment found for this learner" });
      }

      // Get item count
      const items = await app.db
        .select()
        .from(assessmentItems)
        .where(eq(assessmentItems.baselineAssessmentId, assessment.id));

      const correctCount = items.filter((i) => i.isCorrect).length;

      let progress = 0;
      if (assessment.status === "COMPLETED") {
        progress = 100;
      } else {
        const raw = assessment.rawResponses as { irtState?: IrtState } | null;
        if (raw?.irtState) {
          progress = assessmentProgress(raw.irtState);
        }
      }

      return reply.send({
        assessmentId: assessment.id,
        status: assessment.status,
        assessmentMode: assessment.assessmentMode,
        questionsAnswered: items.length,
        questionsCorrect: correctCount,
        progress,
        domains: assessment.domains,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
      });
    },
  );
}
