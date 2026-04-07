import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { and, eq, lt, gt } from "drizzle-orm";
import { subscriptions, dataLifecycleEvents } from "@aivo/db";
import { publishEvent } from "@aivo/events";

export function setupTrialReminderCron(app: FastifyInstance): cron.ScheduledTask {
  // Daily at 9:00 AM UTC — send trial expiration reminders
  const task = cron.schedule("0 9 * * *", async () => {
    app.log.info("Starting trial reminder cron");

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    try {
      // Find all TRIALING subscriptions
      const trialingSubs = await app.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "TRIALING"),
            gt(subscriptions.trialEndsAt, now),
          ),
        );

      let sentCount = 0;

      for (const sub of trialingSubs) {
        if (!sub.trialEndsAt) continue;

        const daysRemaining = Math.ceil(
          (sub.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Determine which reminder to send
        let reminderType: "3day" | "1day" | null = null;
        if (daysRemaining <= 3 && daysRemaining > 1) {
          reminderType = "3day";
        } else if (daysRemaining <= 1) {
          reminderType = "1day";
        }

        if (!reminderType) continue;

        const eventType = reminderType === "3day"
          ? "TRIAL_REMINDER_3DAY"
          : "TRIAL_REMINDER_1DAY";

        try {
          // Check if reminder was already sent
          const existingReminders = await app.db
            .select()
            .from(dataLifecycleEvents)
            .where(
              eq(dataLifecycleEvents.eventType, eventType),
            );

          const alreadySent = existingReminders.some(
            (e) => (e.metadata as Record<string, unknown>)?.subscriptionId === sub.id,
          );

          if (alreadySent) {
            app.log.debug({ subscriptionId: sub.id, reminderType }, "Trial reminder already sent, skipping");
            continue;
          }

          const eventName = reminderType === "3day"
            ? "billing.trial.reminder_3day"
            : "billing.trial.reminder_1day";

          await publishEvent(app.nats, eventName, {
            tenantId: sub.tenantId,
            planId: sub.planId,
            subscriptionId: sub.id,
            trialEndsAt: sub.trialEndsAt.toISOString(),
            daysRemaining,
          });

          // Log lifecycle event to prevent duplicate sends
          await app.db.insert(dataLifecycleEvents).values({
            learnerId: sub.tenantId,
            eventType,
            metadata: {
              subscriptionId: sub.id,
              tenantId: sub.tenantId,
              trialEndsAt: sub.trialEndsAt.toISOString(),
            },
          });

          sentCount++;
          app.log.info(
            { subscriptionId: sub.id, tenantId: sub.tenantId, reminderType },
            "Trial reminder sent",
          );
        } catch (err) {
          app.log.error(
            { err, subscriptionId: sub.id },
            "Failed to send trial reminder",
          );
        }
      }

      app.log.info(
        { candidates: trialingSubs.length, sent: sentCount },
        "Trial reminder cron completed",
      );
    } catch (err) {
      app.log.error({ err }, "Trial reminder cron failed");
    }
  });

  app.log.info("Trial reminder cron scheduled (daily 9:00 UTC)");
  return task;
}
