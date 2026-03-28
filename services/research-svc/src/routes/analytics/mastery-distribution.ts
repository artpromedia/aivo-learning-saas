import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { addDifferentialPrivacy } from "../../services/anonymizer.js";

const MINIMUM_GROUP_SIZE = 30;

export async function masteryDistributionRoute(app: FastifyInstance) {
  app.get(
    "/research/analytics/mastery-distribution",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        cohortId?: string;
        subject?: string;
        epsilon?: string;
      };

      const epsilon = query.epsilon ? parseFloat(query.epsilon) : 1.0;

      const rows = await app.sql`
        SELECT
          sm.mastery_level,
          count(*)::int as learner_count,
          avg(sm.score)::real as avg_score
        FROM skill_mastery sm
        ${query.cohortId ? app.sql`
          JOIN research_cohorts rc ON rc.id = ${query.cohortId}
        ` : app.sql``}
        ${query.subject ? app.sql`WHERE sm.subject = ${query.subject}` : app.sql``}
        GROUP BY sm.mastery_level
        HAVING count(*) >= ${MINIMUM_GROUP_SIZE}
        ORDER BY sm.mastery_level
      `;

      const distribution = rows.map((row: Record<string, unknown>) => ({
        masteryLevel: row.mastery_level,
        learnerCount: Math.round(addDifferentialPrivacy(row.learner_count as number, epsilon)),
        avgScore: Math.round(addDifferentialPrivacy(row.avg_score as number, epsilon) * 100) / 100,
      }));

      return reply.send({
        distribution,
        metadata: {
          minimumGroupSize: MINIMUM_GROUP_SIZE,
          epsilon,
          noiseApplied: true,
        },
      });
    },
  );
}
