import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { sql, and, eq, lt } from "drizzle-orm";
import { learnerXp, learners, users } from "@aivo/db";
import { publishEvent } from "@aivo/events";

export function setupStreakCheckCron(app: FastifyInstance): cron.ScheduledTask {
  // Daily at 6:00 AM UTC
  const task = cron.schedule("0 6 * * *", async () => {
    app.log.info("Starting daily streak check cron");

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Find learners whose last activity was more than 1 day ago and have an active streak
      const brokenStreaks = await app.db
        .select({
          learnerId: learnerXp.learnerId,
          currentStreakDays: learnerXp.currentStreakDays,
        })
        .from(learnerXp)
        .where(
          and(
            sql`${learnerXp.currentStreakDays} > 0`,
            sql`${learnerXp.lastActivityDate} < ${yesterdayStr}`,
          ),
        );

      for (const streak of brokenStreaks) {
        try {
          // Publish streak broken event
          await publishEvent(app.nats, "engagement.streak.broken", {
            learnerId: streak.learnerId,
            previousStreak: streak.currentStreakDays,
          });

          app.log.info({ learnerId: streak.learnerId, previousStreak: streak.currentStreakDays }, "Streak broken event published");
        } catch (err) {
          app.log.error({ err, learnerId: streak.learnerId }, "Failed to publish streak broken event");
        }
      }

      app.log.info({ count: brokenStreaks.length }, "Daily streak check completed");
    } catch (err) {
      app.log.error({ err }, "Streak check cron failed");
    }
  });

  app.log.info("Streak check cron scheduled (daily 6:00 AM UTC)");
  return task;
}
