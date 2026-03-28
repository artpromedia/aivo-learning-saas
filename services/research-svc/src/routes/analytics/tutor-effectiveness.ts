import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { addDifferentialPrivacy } from "../../services/anonymizer.js";

const MINIMUM_GROUP_SIZE = 30;

export async function tutorEffectivenessRoute(app: FastifyInstance) {
  app.get(
    "/research/analytics/tutor-effectiveness",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        tutorType?: string;
        epsilon?: string;
      };

      const epsilon = query.epsilon ? parseFloat(query.epsilon) : 1.0;

      const rows = await app.sql`
        SELECT
          ts.strategy_type as tutor_strategy,
          count(DISTINCT ts.session_id)::int as session_count,
          avg(ts.effectiveness_score)::real as avg_effectiveness,
          avg(ts.engagement_score)::real as avg_engagement,
          count(DISTINCT ts.learner_id)::int as learner_count
        FROM tutor_sessions ts
        ${query.tutorType ? app.sql`WHERE ts.tutor_type = ${query.tutorType}` : app.sql``}
        GROUP BY ts.strategy_type
        HAVING count(DISTINCT ts.learner_id) >= ${MINIMUM_GROUP_SIZE}
        ORDER BY avg(ts.effectiveness_score) DESC
      `;

      const effectiveness = rows.map((row: Record<string, unknown>) => ({
        tutorStrategy: row.tutor_strategy,
        sessionCount: Math.round(addDifferentialPrivacy(row.session_count as number, epsilon)),
        avgEffectiveness: Math.round(addDifferentialPrivacy(row.avg_effectiveness as number || 0, epsilon) * 100) / 100,
        avgEngagement: Math.round(addDifferentialPrivacy(row.avg_engagement as number || 0, epsilon) * 100) / 100,
        learnerCount: Math.round(addDifferentialPrivacy(row.learner_count as number, epsilon)),
      }));

      return reply.send({
        effectiveness,
        metadata: {
          minimumGroupSize: MINIMUM_GROUP_SIZE,
          epsilon,
          noiseApplied: true,
        },
      });
    },
  );
}
