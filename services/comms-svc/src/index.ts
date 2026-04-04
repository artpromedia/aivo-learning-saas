import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";

import { loadConfig } from "./config.js";
import { observabilityPlugin } from "@aivo/observability";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import emailPlugin from "./plugins/email.js";
import firebasePlugin from "./plugins/firebase.js";
import webPushPlugin from "./plugins/web-push.js";
import socketPlugin from "./plugins/socket.js";

// Routes
import { healthRoutes } from "./routes/health.js";
import { inboxRoute } from "./routes/notifications/inbox.js";
import { markReadRoute } from "./routes/notifications/mark-read.js";
import { markAllReadRoute } from "./routes/notifications/mark-all-read.js";
import { preferencesRoute } from "./routes/notifications/preferences.js";
import { registerPushRoute } from "./routes/push/register.js";
import { unregisterPushRoute } from "./routes/push/unregister.js";
import { websocketRoute } from "./routes/websocket/connect.js";
import { newsletterSubscribeRoute } from "./routes/newsletter/subscribe.js";
import { careersApplyRoute } from "./routes/careers/apply.js";

// Events
import { setupSubscribers } from "./events/subscribers.js";

// Cron
import { setupWeeklyDigestCron } from "./cron/weekly-digest.js";
import { setupStreakCheckCron } from "./cron/streak-check.js";
import { setupIepRefreshCheckCron } from "./cron/iep-refresh-check.js";

export async function buildApp() {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Error handler
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

  // Core plugins
  await app.register(cookie);
  await app.register(cors, {
    origin: [config.APP_URL, "http://localhost:3100"],
    credentials: true,
  });
  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Infrastructure plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(emailPlugin);
  await app.register(firebasePlugin);
  await app.register(webPushPlugin);
  await app.register(socketPlugin);

  await app.register(observabilityPlugin, {
    serviceName: 'comms-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });

  // Register routes
  await app.register(healthRoutes);
  await app.register(inboxRoute);
  await app.register(markReadRoute);
  await app.register(markAllReadRoute);
  await app.register(preferencesRoute);
  await app.register(registerPushRoute);
  await app.register(unregisterPushRoute);
  await app.register(websocketRoute);
  await app.register(newsletterSubscribeRoute);
  await app.register(careersApplyRoute);

  // Set up cron jobs
  const cronTasks = [
    setupWeeklyDigestCron(app),
    setupStreakCheckCron(app),
    setupIepRefreshCheckCron(app),
  ];

  // Clean up cron on shutdown
  app.addHook("onClose", async () => {
    for (const task of cronTasks) {
      task.stop();
    }
  });

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`comms-svc listening on port ${config.PORT}`);

  // Set up NATS subscribers AFTER the server is listening so health
  // checks pass immediately.  Subscribers are background consumers —
  // they don't need to be ready before serving HTTP requests.
  setupSubscribers(app).catch((err) => {
    app.log.error(err, "Failed to set up NATS subscribers");
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
