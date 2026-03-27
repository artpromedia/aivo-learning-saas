import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { DeliveryEngine } from "../webhooks/delivery-engine.js";

export function startWebhookRetryCron(app: FastifyInstance) {
  // Retry failed webhook deliveries every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const engine = new DeliveryEngine(app);
      const retried = await engine.retryFailedDeliveries();
      if (retried > 0) {
        app.log.info({ retried }, "Webhook retry completed");
      }
    } catch (err) {
      app.log.error(err, "Webhook retry cron failed");
    }
  });

  app.log.info("Webhook retry cron registered (every 5 minutes)");
}
