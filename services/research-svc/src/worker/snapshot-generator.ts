import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { researchCohorts, anonymizedSnapshots } from "@aivo/db";
import { publishEvent } from "@aivo/events";

async function generateSnapshots(app: FastifyInstance): Promise<void> {
  app.log.info("Starting daily snapshot generation...");

  const cohorts = await app.db
    .select()
    .from(researchCohorts);

  const today = new Date().toISOString().split("T")[0];

  for (const cohort of cohorts) {
    if (cohort.learnerCount < 30) {
      app.log.info(`Skipping cohort ${cohort.id}: learner count ${cohort.learnerCount} below minimum`);
      continue;
    }

    try {
      const kAnonymityLevel = 10;
      const noiseEpsilon = 1.0;

      const aggregateData = await app.sql`
        SELECT
          count(DISTINCT lp.id)::int as total_learners,
          avg(sm.score)::real as avg_score,
          avg(sm.progress_rate)::real as avg_progress_rate,
          count(DISTINCT CASE WHEN sm.mastery_level = 'PROFICIENT' THEN lp.id END)::int as proficient_count
        FROM learner_profiles lp
        LEFT JOIN skill_mastery sm ON sm.learner_id = lp.id
      `;

      const data = aggregateData[0] ?? {
        total_learners: 0,
        avg_score: 0,
        avg_progress_rate: 0,
        proficient_count: 0,
      };

      await app.db
        .insert(anonymizedSnapshots)
        .values({
          cohortId: cohort.id,
          snapshotDate: today,
          aggregateData: data,
          kAnonymityLevel,
          noiseEpsilon,
        });

      await publishEvent(app.nats, "research.snapshot.generated", {
        cohortId: cohort.id,
        snapshotDate: today,
        kAnonymityLevel,
      });

      app.log.info(`Snapshot generated for cohort ${cohort.id}`);
    } catch (err) {
      app.log.error(`Failed to generate snapshot for cohort ${cohort.id}: ${err}`);
    }
  }

  app.log.info("Daily snapshot generation complete");
}

export function startSnapshotGenerator(app: FastifyInstance): void {
  cron.schedule("0 2 * * *", () => {
    generateSnapshots(app).catch((err) => {
      app.log.error(`Snapshot generation cron failed: ${err}`);
    });
  });

  app.log.info("Snapshot generator cron scheduled (daily at 02:00 UTC)");
}
