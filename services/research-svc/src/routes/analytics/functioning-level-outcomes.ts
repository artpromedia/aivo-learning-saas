import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { addDifferentialPrivacy } from "../../services/anonymizer.js";

const MINIMUM_GROUP_SIZE = 30;

export async function functioningLevelOutcomesRoute(app: FastifyInstance) {
  app.get(
    "/research/analytics/functioning-level-outcomes",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        cohortId?: string;
        startDate?: string;
        endDate?: string;
        epsilon?: string;
      };

      const epsilon = query.epsilon ? parseFloat(query.epsilon) : 1.0;

      const conditions: string[] = [];
      if (query.startDate) conditions.push(`lp.created_at >= '${query.startDate}'`);
      if (query.endDate) conditions.push(`lp.created_at <= '${query.endDate}'`);

      const rows = await app.sql`
        SELECT
          lp.functioning_level,
          count(DISTINCT lp.id)::int as learner_count,
          avg(sm.score)::real as avg_outcome_score,
          avg(sm.progress_rate)::real as avg_progress_rate
        FROM learner_profiles lp
        LEFT JOIN skill_mastery sm ON sm.learner_id = lp.id
        GROUP BY lp.functioning_level
        HAVING count(DISTINCT lp.id) >= ${MINIMUM_GROUP_SIZE}
        ORDER BY lp.functioning_level
      `;

      const outcomes = rows.map((row: Record<string, unknown>) => ({
        functioningLevel: row.functioning_level,
        learnerCount: Math.round(addDifferentialPrivacy(row.learner_count as number, epsilon)),
        avgOutcomeScore: Math.round(addDifferentialPrivacy(row.avg_outcome_score as number || 0, epsilon) * 100) / 100,
        avgProgressRate: Math.round(addDifferentialPrivacy(row.avg_progress_rate as number || 0, epsilon) * 100) / 100,
      }));

      return reply.send({
        outcomes,
        metadata: {
          minimumGroupSize: MINIMUM_GROUP_SIZE,
          epsilon,
          noiseApplied: true,
        },
      });
    },
  );
}
