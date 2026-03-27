import type { FastifyInstance } from "fastify";
import { StringCodec } from "nats";
import { brainRollouts } from "@aivo/db";
import { eq, and } from "drizzle-orm";

const sc = StringCodec();

export async function setupSubscribers(app: FastifyInstance) {
  const nc = app.nats;

  // Subscribe to brain.regression.detected → update rollout dashboard
  const regressionSub = nc.subscribe("aivo.brain.regression.detected");
  (async () => {
    for await (const msg of regressionSub) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        app.log.info({ data }, "Brain regression detected event received");

        const activeRollouts = await app.db
          .select()
          .from(brainRollouts)
          .where(
            and(
              eq(brainRollouts.status, "MONITORING"),
            ),
          );

        for (const rollout of activeRollouts) {
          await app.db
            .update(brainRollouts)
            .set({
              regressionsDetected: rollout.regressionsDetected + 1,
              updatedAt: new Date(),
            })
            .where(eq(brainRollouts.id, rollout.id));
        }
      } catch (err) {
        app.log.error(err, "Failed to handle brain regression event");
      }
    }
  })();

  // Subscribe to billing.subscription.created → update tenant analytics
  const subCreatedSub = nc.subscribe("aivo.billing.subscription.created");
  (async () => {
    for await (const msg of subCreatedSub) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        app.log.info({ tenantId: data.tenantId }, "Subscription created event received");
        // Invalidate analytics cache so next request gets fresh data
        await app.redis.del("admin:analytics:overview");
        await app.redis.del("admin:analytics:revenue");
      } catch (err) {
        app.log.error(err, "Failed to handle subscription created event");
      }
    }
  })();

  // Subscribe to billing.subscription.cancelled → update tenant analytics
  const subCancelledSub = nc.subscribe("aivo.billing.subscription.cancelled");
  (async () => {
    for await (const msg of subCancelledSub) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        app.log.info({ tenantId: data.tenantId }, "Subscription cancelled event received");
        await app.redis.del("admin:analytics:overview");
        await app.redis.del("admin:analytics:revenue");
      } catch (err) {
        app.log.error(err, "Failed to handle subscription cancelled event");
      }
    }
  })();

  app.log.info("NATS subscribers initialized");

  app.addHook("onClose", async () => {
    regressionSub.unsubscribe();
    subCreatedSub.unsubscribe();
    subCancelledSub.unsubscribe();
  });
}
