import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { sql, eq } from "drizzle-orm";
import { learners, users } from "@aivo/db";
import { EmailService } from "../services/email.service.js";
import { getConfig } from "../config.js";

export function setupIepRefreshCheckCron(app: FastifyInstance): cron.ScheduledTask {
  // 1st of each month at 10:00 AM UTC
  const task = cron.schedule("0 10 1 * *", async () => {
    app.log.info("Starting monthly IEP refresh check cron");
    const config = getConfig();
    const emailService = new EmailService(app);

    try {
      // Find learners with IEP documents older than 10 months
      // We check for learners that have an IEP (via brain-svc data)
      // For now we check learners with a non-STANDARD functioning level
      // as a proxy for having an IEP on file
      const learnersWithOldIep = await app.db
        .select({
          learnerId: learners.id,
          learnerName: learners.name,
          parentId: learners.parentId,
          createdAt: learners.createdAt,
        })
        .from(learners)
        .where(
          sql`${learners.functioningLevel} != 'STANDARD' AND ${learners.createdAt} < NOW() - INTERVAL '10 months'`,
        );

      for (const learner of learnersWithOldIep) {
        try {
          const [parent] = await app.db
            .select()
            .from(users)
            .where(eq(users.id, learner.parentId))
            .limit(1);

          if (!parent) continue;

          const ageMonths = Math.floor(
            (Date.now() - learner.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
          );

          await emailService.sendTemplate("iep_refresh_reminder", parent.email, parent.id, {
            userName: parent.name,
            learnerName: learner.learnerName,
            iepAge: `${ageMonths} months`,
            uploadUrl: `${config.APP_URL}/parent/${learner.learnerId}/iep`,
          });

          app.log.info({ learnerId: learner.learnerId }, "IEP refresh reminder sent");
        } catch (err) {
          app.log.error({ err, learnerId: learner.learnerId }, "Failed to send IEP refresh reminder");
        }
      }

      app.log.info({ count: learnersWithOldIep.length }, "Monthly IEP refresh check completed");
    } catch (err) {
      app.log.error({ err }, "IEP refresh check cron failed");
    }
  });

  app.log.info("IEP refresh check cron scheduled (1st of month 10:00 AM UTC)");
  return task;
}
