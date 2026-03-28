import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { and, eq, lt } from "drizzle-orm";
import { subscriptions } from "@aivo/db";
import { publishEvent } from "@aivo/events";

export function setupDataDeletionTriggerCron(app: FastifyInstance): cron.ScheduledTask {
  // Daily at 2:00 AM UTC — trigger data deletion for expired grace periods
  const task = cron.schedule("0 2 * * *", async () => {
    app.log.info("Starting data deletion trigger cron");

    const now = new Date();

    try {
      // Find subscriptions that just expired (status still GRACE_PERIOD, grace ended)
      const expiredSubs = await app.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "GRACE_PERIOD"),
            lt(subscriptions.gracePeriodEndsAt, now),
          ),
        );

      for (const sub of expiredSubs) {
        try {
          // Mark as CANCELLED
          await app.db
            .update(subscriptions)
            .set({ status: "CANCELLED", updatedAt: now })
            .where(eq(subscriptions.id, sub.id));

          // Emit event for brain-svc to handle data deletion
          await publishEvent(app.nats, "billing.subscription.grace.expired", {
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
          });

          app.log.info(
            { subscriptionId: sub.id, tenantId: sub.tenantId },
            "Grace period expired, data deletion triggered",
          );
        } catch (err) {
          app.log.error(
            { err, subscriptionId: sub.id },
            "Failed to trigger data deletion",
          );
        }
      }

      app.log.info(
        { count: expiredSubs.length },
        "Data deletion trigger cron completed",
      );
    } catch (err) {
      app.log.error({ err }, "Data deletion trigger cron failed");
    }
  });

  app.log.info("Data deletion trigger cron scheduled (daily 2:00 UTC)");
  return task;
}
