import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { ZodError } from "zod";
import { loadConfig } from "./config.js";
import { observabilityPlugin } from "@aivo/observability";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import brainClientPlugin from "./plugins/brain-client.js";
import aiClientPlugin from "./plugins/ai-client.js";

// Routes
import { healthRoutes } from "./routes/health.js";
import { listCatalogRoute } from "./routes/catalog/list.js";
import { listSubscriptionsRoute } from "./routes/subscriptions/list.js";
import { subscribeRoute } from "./routes/subscriptions/subscribe.js";
import { cancelSubscriptionRoute } from "./routes/subscriptions/cancel.js";
import { startSessionRoute } from "./routes/sessions/start.js";
import { messageSessionRoute } from "./routes/sessions/message.js";
import { endSessionRoute } from "./routes/sessions/end.js";
import { getSessionRoute } from "./routes/sessions/get.js";
import { sessionHistoryRoute } from "./routes/sessions/history.js";
import { uploadHomeworkRoute } from "./routes/homework/upload.js";
import { getHomeworkRoute } from "./routes/homework/get.js";
import { homeworkSessionStartRoute } from "./routes/homework/session-start.js";
import { homeworkSessionMessageRoute } from "./routes/homework/session-message.js";
import { homeworkSessionEndRoute } from "./routes/homework/session-end.js";

// Events
import { setupSubscribers } from "./events/subscribers.js";

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

  // Infrastructure plugins
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(brainClientPlugin);
  await app.register(aiClientPlugin);

  await app.register(observabilityPlugin, {
    serviceName: 'tutor-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });

  // Routes
  await app.register(healthRoutes);
  await app.register(listCatalogRoute);
  await app.register(listSubscriptionsRoute);
  await app.register(subscribeRoute);
  await app.register(cancelSubscriptionRoute);
  await app.register(startSessionRoute);
  await app.register(messageSessionRoute);
  await app.register(endSessionRoute);
  await app.register(getSessionRoute);
  await app.register(sessionHistoryRoute);
  await app.register(uploadHomeworkRoute);
  await app.register(getHomeworkRoute);
  await app.register(homeworkSessionStartRoute);
  await app.register(homeworkSessionMessageRoute);
  await app.register(homeworkSessionEndRoute);

  // NATS subscribers
  try {
    await setupSubscribers(app);
  } catch {
    app.log.warn("NATS subscribers could not be set up");
  }

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`tutor-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
