import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { interventionStudies, researchCohorts } from "@aivo/db";
import { eq } from "drizzle-orm";
import { addDifferentialPrivacy } from "../../services/anonymizer.js";

const MINIMUM_GROUP_SIZE = 30;

export async function interventionEffectivenessRoute(app: FastifyInstance) {
  app.get(
    "/research/analytics/intervention-effectiveness",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        studyId?: string;
        epsilon?: string;
      };

      const epsilon = query.epsilon ? parseFloat(query.epsilon) : 1.0;

      if (!query.studyId) {
        return reply.status(400).send({ error: "studyId is required" });
      }

      const [study] = await app.db
        .select()
        .from(interventionStudies)
        .where(eq(interventionStudies.id, query.studyId))
        .limit(1);

      if (!study) {
        return reply.status(404).send({ error: "Study not found" });
      }

      const [controlCohort] = await app.db
        .select()
        .from(researchCohorts)
        .where(eq(researchCohorts.id, study.controlCohortId))
        .limit(1);

      const [treatmentCohort] = await app.db
        .select()
        .from(researchCohorts)
        .where(eq(researchCohorts.id, study.treatmentCohortId))
        .limit(1);

      if (!controlCohort || !treatmentCohort) {
        return reply.status(404).send({ error: "Study cohorts not found" });
      }

      if (controlCohort.learnerCount < MINIMUM_GROUP_SIZE || treatmentCohort.learnerCount < MINIMUM_GROUP_SIZE) {
        return reply.status(400).send({
          error: `Both cohorts must have at least ${MINIMUM_GROUP_SIZE} learners`,
        });
      }

      const rows = await app.sql`
        SELECT
          'control' as group_type,
          count(*)::int as learner_count,
          avg(metric_value)::real as avg_metric
        FROM research_study_metrics
        WHERE study_id = ${query.studyId} AND group_type = 'control'
        UNION ALL
        SELECT
          'treatment' as group_type,
          count(*)::int as learner_count,
          avg(metric_value)::real as avg_metric
        FROM research_study_metrics
        WHERE study_id = ${query.studyId} AND group_type = 'treatment'
      `;

      const results = rows.map((row: Record<string, unknown>) => ({
        groupType: row.group_type,
        learnerCount: Math.round(addDifferentialPrivacy(row.learner_count as number || 0, epsilon)),
        avgMetric: Math.round(addDifferentialPrivacy(row.avg_metric as number || 0, epsilon) * 100) / 100,
      }));

      const control = results.find((r: { groupType: unknown }) => r.groupType === "control");
      const treatment = results.find((r: { groupType: unknown }) => r.groupType === "treatment");

      const effectSize = control && treatment
        ? Math.round((treatment.avgMetric - control.avgMetric) * 100) / 100
        : null;

      return reply.send({
        study: {
          id: study.id,
          name: study.name,
          metric: study.metric,
          status: study.status,
        },
        results: {
          control,
          treatment,
          effectSize,
        },
        metadata: {
          minimumGroupSize: MINIMUM_GROUP_SIZE,
          epsilon,
          noiseApplied: true,
        },
      });
    },
  );
}
