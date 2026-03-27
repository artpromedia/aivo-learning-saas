import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { AnalyticsService } from "../services/analytics.service.js";

export function startAnalyticsCacheCron(app: FastifyInstance) {
  // Pre-compute analytics aggregates every hour
  cron.schedule("0 * * * *", async () => {
    try {
      app.log.info("Running analytics cache refresh");
      const service = new AnalyticsService(app);
      await service.refreshAllCaches();
      app.log.info("Analytics cache refresh completed");
    } catch (err) {
      app.log.error(err, "Analytics cache refresh failed");
    }
  });

  app.log.info("Analytics cache cron scheduled (hourly)");
}
