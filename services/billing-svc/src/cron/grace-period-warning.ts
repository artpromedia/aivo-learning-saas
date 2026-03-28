import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { and, eq, lt, gt } from "drizzle-orm";
import { subscriptions, dataLifecycleEvents } from "@aivo/db";
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

      let sentCount = 0;

      for (const sub of warningSubs) {
        try {
          // Check if warning was already sent for this subscription (send only once)
          const existingWarnings = await app.db
            .select()
            .from(dataLifecycleEvents)
            .where(
              and(
                eq(dataLifecycleEvents.eventType, "GRACE_PERIOD_WARNING_7DAY"),
              ),
            );

          const alreadySent = existingWarnings.some(
            (e) => (e.metadata as Record<string, unknown>)?.subscriptionId === sub.id,
          );

          if (alreadySent) {
            app.log.debug({ subscriptionId: sub.id }, "7-day warning already sent, skipping");
            continue;
          }

          await publishEvent(app.nats, "billing.subscription.grace.warning_7day", {
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
            gracePeriodEndsAt: sub.gracePeriodEndsAt?.toISOString(),
          });

          // Log lifecycle event so we don't send twice
          await app.db.insert(dataLifecycleEvents).values({
            learnerId: sub.tenantId,
            eventType: "GRACE_PERIOD_WARNING_7DAY",
            metadata: {
              subscriptionId: sub.id,
              tenantId: sub.tenantId,
              gracePeriodEndsAt: sub.gracePeriodEndsAt?.toISOString(),
            },
          });

          sentCount++;
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
        { candidates: warningSubs.length, sent: sentCount },
        "Grace period 7-day warning cron completed",
      );
    } catch (err) {
      app.log.error({ err }, "Grace period warning cron failed");
    }
  });

  app.log.info("Grace period 7-day warning cron scheduled (daily 9:00 UTC)");
  return task;
}
