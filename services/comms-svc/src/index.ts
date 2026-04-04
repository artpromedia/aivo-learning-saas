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
  console.log("[comms-svc] buildApp: start");
  const config = loadConfig();
  console.log("[comms-svc] buildApp: config loaded");

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
  console.log("[comms-svc] registering core plugins...");
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
  console.log("[comms-svc] core plugins done");

  // Infrastructure plugins
  console.log("[comms-svc] registering db...");
  await app.register(dbPlugin);
  console.log("[comms-svc] registering nats...");
  await app.register(natsPlugin);
  console.log("[comms-svc] registering redis...");
  await app.register(redisPlugin);
  console.log("[comms-svc] registering email...");
  await app.register(emailPlugin);
  console.log("[comms-svc] registering firebase...");
  await app.register(firebasePlugin);
  console.log("[comms-svc] registering web-push...");
  await app.register(webPushPlugin);
  console.log("[comms-svc] registering socket...");
  await app.register(socketPlugin);
  console.log("[comms-svc] infra plugins done");

  console.log("[comms-svc] registering observability...");
  await app.register(observabilityPlugin, {
    serviceName: 'comms-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });
  console.log("[comms-svc] observability done");

  // Register routes
  console.log("[comms-svc] registering routes...");
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
  console.log("[comms-svc] routes done");

  // Set up NATS event subscribers
  console.log("[comms-svc] setting up subscribers...");
  await setupSubscribers(app);
  console.log("[comms-svc] subscribers done");

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

  console.log("[comms-svc] buildApp: complete");
  return app;
}

console.log("[comms-svc] loading config...");
const config = loadConfig();
console.log("[comms-svc] config loaded, building app...");
const app = await buildApp();
console.log("[comms-svc] app built, starting listen...");

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`comms-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
