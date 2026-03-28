import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";

import { loadConfig } from "./config.js";
import { observabilityPlugin } from "@aivo/observability";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import identityClientPlugin from "./plugins/identity-client.js";
import assessmentClientPlugin from "./plugins/assessment-client.js";
import s3Plugin from "./plugins/s3.js";

// Routes — Health
import { healthRoutes } from "./routes/health.js";

// Routes — Clever
import { cleverOAuthRoute } from "./routes/clever/oauth.js";
import { cleverCallbackRoute } from "./routes/clever/callback.js";
import { cleverSyncRoute } from "./routes/clever/sync.js";
import { cleverWebhookRoute } from "./routes/clever/webhook.js";

// Routes — ClassLink
import { classLinkOAuthRoute } from "./routes/classlink/oauth.js";
import { classLinkCallbackRoute } from "./routes/classlink/callback.js";
import { classLinkSyncRoute } from "./routes/classlink/sync.js";
import { classLinkRosterRoute } from "./routes/classlink/roster.js";

// Routes — OneRoster
import { oneRosterSyncRoute } from "./routes/oneroster/sync.js";
import { oneRosterConfigRoute } from "./routes/oneroster/config.js";

// Routes — LTI
import { ltiJwksRoute } from "./routes/lti/jwks.js";
import { ltiLoginRoute } from "./routes/lti/login.js";
import { ltiLaunchRoute } from "./routes/lti/launch.js";
import { ltiDeepLinkRoute } from "./routes/lti/deep-link.js";
import { ltiAgsRoute } from "./routes/lti/ags.js";

// Routes — Webhooks
import { webhookManageRoutes } from "./routes/webhooks/manage.js";
import { webhookDeliveriesRoute } from "./routes/webhooks/deliveries.js";
import { webhookTestRoute } from "./routes/webhooks/test.js";

// Routes — CSV
import { csvUploadRoute } from "./routes/csv/upload.js";
import { csvTemplateRoute } from "./routes/csv/template.js";
import { csvJobStatusRoute } from "./routes/csv/status.js";

// Events
import { setupSubscribers } from "./events/subscribers.js";

// Cron
import { startScheduledSyncCron } from "./cron/scheduled-sync.js";
import { startWebhookRetryCron } from "./cron/webhook-retry.js";

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
    if (statusCode >= 500) app.log.error(error);

    return reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : (error as Error).message,
    });
  });

  // Core plugins
  await app.register(cookie);
  await app.register(cors, { origin: config.APP_URL, credentials: true });
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

  // Infrastructure plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(identityClientPlugin);
  await app.register(assessmentClientPlugin);
  await app.register(s3Plugin);

  await app.register(observabilityPlugin, {
    serviceName: 'integrations-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });

  // Register routes
  await app.register(healthRoutes);

  // Clever
  await app.register(cleverOAuthRoute);
  await app.register(cleverCallbackRoute);
  await app.register(cleverSyncRoute);
  await app.register(cleverWebhookRoute);

  // ClassLink
  await app.register(classLinkOAuthRoute);
  await app.register(classLinkCallbackRoute);
  await app.register(classLinkSyncRoute);
  await app.register(classLinkRosterRoute);

  // OneRoster
  await app.register(oneRosterSyncRoute);
  await app.register(oneRosterConfigRoute);

  // LTI
  await app.register(ltiJwksRoute);
  await app.register(ltiLoginRoute);
  await app.register(ltiLaunchRoute);
  await app.register(ltiDeepLinkRoute);
  await app.register(ltiAgsRoute);

  // Webhooks
  await app.register(webhookManageRoutes);
  await app.register(webhookDeliveriesRoute);
  await app.register(webhookTestRoute);

  // CSV
  await app.register(csvUploadRoute);
  await app.register(csvTemplateRoute);
  await app.register(csvJobStatusRoute);

  // Event subscribers
  await setupSubscribers(app);

  // Cron jobs
  startScheduledSyncCron(app);
  startWebhookRetryCron(app);

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`integrations-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
