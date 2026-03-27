import type { FastifyInstance } from "fastify";
import cron from "node-cron";
import { DunningService } from "../services/dunning.service.js";

export function setupDunningRetryCron(app: FastifyInstance): cron.ScheduledTask {
  // Daily at 8:00 AM UTC
  const task = cron.schedule("0 8 * * *", async () => {
    app.log.info("Starting daily dunning check");
    const service = new DunningService(app);

    try {
      const suspended = await service.checkAndSuspend();
      app.log.info({ suspended }, "Dunning check completed");
    } catch (err) {
      app.log.error({ err }, "Dunning check failed");
    }
  });

  app.log.info("Dunning retry cron scheduled (daily 8:00 AM UTC)");
  return task;
}
