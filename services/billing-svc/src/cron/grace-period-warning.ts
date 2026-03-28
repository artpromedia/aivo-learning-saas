import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { and, eq, lt, gt } from "drizzle-orm";
import { subscriptions } from "@aivo/db";
import { publishEvent } from "@aivo/events";

export function setupGracePeriodWarningCron(app: FastifyInstance): cron.ScheduledTask {
  // Daily at 9:00 AM UTC — send 7-day warnings
  const task = cron.schedule("0 9 * * *", async () => {
    app.log.info("Starting grace period 7-day warning cron");

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      // Find subscriptions where grace period ends within 7 days
      const warningSubs = await app.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "GRACE_PERIOD"),
            lt(subscriptions.gracePeriodEndsAt, sevenDaysFromNow),
            gt(subscriptions.gracePeriodEndsAt, now),
          ),
        );

      for (const sub of warningSubs) {
        try {
          await publishEvent(app.nats, "billing.subscription.grace.warning_7day", {
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
            gracePeriodEndsAt: sub.gracePeriodEndsAt?.toISOString(),
          });

          app.log.info(
            { subscriptionId: sub.id, tenantId: sub.tenantId },
            "7-day grace period warning sent",
          );
        } catch (err) {
          app.log.error(
            { err, subscriptionId: sub.id },
            "Failed to send grace period warning",
          );
        }
      }

      app.log.info(
        { count: warningSubs.length },
        "Grace period 7-day warning cron completed",
      );
    } catch (err) {
      app.log.error({ err }, "Grace period warning cron failed");
    }
  });

  app.log.info("Grace period 7-day warning cron scheduled (daily 9:00 UTC)");
  return task;
}
