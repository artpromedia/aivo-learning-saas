import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { brainRollouts, brainVersions, brainStates } from "@aivo/db";
import { eq, and } from "drizzle-orm";

const MASTERY_DROP_THRESHOLD = 15; // percent

export function startBrainRolloutMonitorCron(app: FastifyInstance) {
  // Monitor regression during staged rollout every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    try {
      app.log.info("Running brain rollout regression monitor");

      const activeRollouts = await app.db
        .select()
        .from(brainRollouts)
        .where(eq(brainRollouts.status, "MONITORING"));

      for (const rollout of activeRollouts) {
        const [version] = await app.db
          .select()
          .from(brainVersions)
          .where(eq(brainVersions.id, rollout.brainVersionId))
          .limit(1);

        if (!version) continue;

        const upgradedBrains = await app.db
          .select({ id: brainStates.id })
          .from(brainStates)
          .where(eq(brainStates.mainBrainVersion, version.version));

        let regressions = 0;

        for (const brain of upgradedBrains) {
          try {
            const health = await app.brainClient.getBrainHealth(brain.id);
            const scores = Object.values(health.masteryScores);
            const hasRegression = scores.some((score) => score < (1 - MASTERY_DROP_THRESHOLD / 100));

            if (hasRegression) {
              regressions++;
            }
          } catch {
            // Individual brain health check failure is non-fatal
          }
        }

        if (regressions > 0) {
          await app.db
            .update(brainRollouts)
            .set({
              regressionsDetected: regressions,
              updatedAt: new Date(),
            })
            .where(eq(brainRollouts.id, rollout.id));

          app.log.warn(
            { rolloutId: rollout.id, regressions, version: version.version },
            "Brain regression detected during rollout",
          );
        }
      }

      app.log.info("Brain rollout regression monitor completed");
    } catch (err) {
      app.log.error(err, "Brain rollout regression monitor failed");
    }
  });

  app.log.info("Brain rollout monitor cron scheduled (every 6 hours)");
}
