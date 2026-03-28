import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { addDifferentialPrivacy } from "../../services/anonymizer.js";

const MINIMUM_GROUP_SIZE = 30;

export async function accommodationImpactRoute(app: FastifyInstance) {
  app.get(
    "/research/analytics/accommodation-impact",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        accommodationType?: string;
        epsilon?: string;
      };

      const epsilon = query.epsilon ? parseFloat(query.epsilon) : 1.0;

      const rows = await app.sql`
        SELECT
          ia.accommodation_type,
          count(DISTINCT ia.learner_id)::int as learner_count,
          avg(sm.score)::real as avg_score_with_accommodation,
          avg(sm.progress_rate)::real as avg_progress_with_accommodation
        FROM iep_accommodations ia
        JOIN skill_mastery sm ON sm.learner_id = ia.learner_id
        ${query.accommodationType ? app.sql`WHERE ia.accommodation_type = ${query.accommodationType}` : app.sql``}
        GROUP BY ia.accommodation_type
        HAVING count(DISTINCT ia.learner_id) >= ${MINIMUM_GROUP_SIZE}
        ORDER BY ia.accommodation_type
      `;

      const impact = rows.map((row: Record<string, unknown>) => ({
        accommodationType: row.accommodation_type,
        learnerCount: Math.round(addDifferentialPrivacy(row.learner_count as number, epsilon)),
        avgScoreWithAccommodation: Math.round(addDifferentialPrivacy(row.avg_score_with_accommodation as number || 0, epsilon) * 100) / 100,
        avgProgressWithAccommodation: Math.round(addDifferentialPrivacy(row.avg_progress_with_accommodation as number || 0, epsilon) * 100) / 100,
      }));

      return reply.send({
        impact,
        metadata: {
          minimumGroupSize: MINIMUM_GROUP_SIZE,
          epsilon,
          noiseApplied: true,
        },
      });
    },
  );
}
