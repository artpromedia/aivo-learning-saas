import Fastify from "fastify";
import { ZodError } from "zod";

import { loadConfig } from "./config.js";
import { observabilityPlugin } from "@aivo/observability";

import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";

import { healthRoutes } from "./routes/health.js";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";
import { webhookRoutes } from "./routes/webhook.js";
import { subscriberRoutes } from "./routes/subscribers.js";
import { statusPageRoutes } from "./routes/status-page.js";

import { HealthAggregator } from "./services/health-aggregator.js";
import { seedMonitoredServices } from "./services/seed.js";

export async function buildApp() {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    if (statusCode >= 500) {
      app.log.error(error);
    }

    return reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : (error as Error).message,
    });
  });

  await app.register(dbPlugin);
  await app.register(natsPlugin);

  await app.register(observabilityPlugin, {
    serviceName: 'status-page-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });

  await app.register(healthRoutes);
  await app.register(statusPageRoutes);
  await app.register(publicRoutes);
  await app.register(adminRoutes);
  await app.register(webhookRoutes);
  await app.register(subscriberRoutes);

  const healthAggregator = new HealthAggregator(app);

  app.addHook("onReady", async () => {
    await seedMonitoredServices(app);
    healthAggregator.start();
    app.log.info("Health aggregator started");
  });

  app.addHook("onClose", async () => {
    healthAggregator.stop();
  });

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`status-page-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
