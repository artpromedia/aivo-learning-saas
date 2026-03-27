import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { DigestService } from "../services/digest.service.js";
import { EmailService } from "../services/email.service.js";
import { NotificationService } from "../services/notification.service.js";

export function setupWeeklyDigestCron(app: FastifyInstance): cron.ScheduledTask {
  // Saturday 9:00 AM UTC
  const task = cron.schedule("0 9 * * 6", async () => {
    app.log.info("Starting weekly progress digest cron");
    const digestService = new DigestService(app);
    const emailService = new EmailService(app);
    const notificationService = new NotificationService(app);

    try {
      const learnersList = await digestService.getLearnersForDigest();
      app.log.info({ count: learnersList.length }, "Processing weekly digests");

      for (const learnerData of learnersList) {
        try {
          const weeklyData = await digestService.aggregateWeeklyData(learnerData.learnerId);
          const digestData = digestService.buildDigestData(learnerData, weeklyData);

          await emailService.sendTemplate(
            "weekly_progress_digest",
            learnerData.parentEmail,
            learnerData.parentId,
            digestData,
          );

          await notificationService.create({
            userId: learnerData.parentId,
            type: "weekly_digest",
            title: "Weekly progress report",
            body: `${learnerData.learnerName} earned ${weeklyData.xpEarned} XP and completed ${weeklyData.lessonsCompleted} lessons this week`,
            actionUrl: `/parent/${learnerData.learnerId}`,
          });

          app.log.info({ learnerId: learnerData.learnerId }, "Weekly digest sent");
        } catch (err) {
          app.log.error({ err, learnerId: learnerData.learnerId }, "Failed to send digest for learner");
        }
      }

      app.log.info("Weekly progress digest cron completed");
    } catch (err) {
      app.log.error({ err }, "Weekly digest cron failed");
    }
  });

  app.log.info("Weekly digest cron scheduled (Saturday 9:00 AM UTC)");
  return task;
}
