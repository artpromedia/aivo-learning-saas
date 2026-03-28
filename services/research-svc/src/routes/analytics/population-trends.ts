import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { addDifferentialPrivacy } from "../../services/anonymizer.js";

const MINIMUM_GROUP_SIZE = 30;

export async function populationTrendsRoute(app: FastifyInstance) {
  app.get(
    "/research/analytics/population-trends",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        granularity?: string;
        startDate?: string;
        endDate?: string;
        epsilon?: string;
      };

      const granularity = query.granularity ?? "month";
      const epsilon = query.epsilon ? parseFloat(query.epsilon) : 1.0;

      const dateFormat = granularity === "week" ? "IYYY-IW" : granularity === "day" ? "YYYY-MM-DD" : "YYYY-MM";

      const rows = await app.sql`
        SELECT
          to_char(lp.created_at, ${dateFormat}) as period,
          count(DISTINCT lp.id)::int as new_learners,
          count(DISTINCT CASE WHEN sm.mastery_level = 'PROFICIENT' THEN lp.id END)::int as proficient_count,
          avg(sm.score)::real as avg_score
        FROM learner_profiles lp
        LEFT JOIN skill_mastery sm ON sm.learner_id = lp.id
        ${query.startDate ? app.sql`WHERE lp.created_at >= ${query.startDate}::timestamp` : app.sql``}
        ${query.endDate ? app.sql`${query.startDate ? app.sql`AND` : app.sql`WHERE`} lp.created_at <= ${query.endDate}::timestamp` : app.sql``}
        GROUP BY to_char(lp.created_at, ${dateFormat})
        HAVING count(DISTINCT lp.id) >= ${MINIMUM_GROUP_SIZE}
        ORDER BY period
      `;

      const trends = rows.map((row: Record<string, unknown>) => ({
        period: row.period,
        newLearners: Math.round(addDifferentialPrivacy(row.new_learners as number, epsilon)),
        proficientCount: Math.round(addDifferentialPrivacy(row.proficient_count as number || 0, epsilon)),
        avgScore: Math.round(addDifferentialPrivacy(row.avg_score as number || 0, epsilon) * 100) / 100,
      }));

      return reply.send({
        trends,
        metadata: {
          granularity,
          minimumGroupSize: MINIMUM_GROUP_SIZE,
          epsilon,
          noiseApplied: true,
        },
      });
    },
  );
}
