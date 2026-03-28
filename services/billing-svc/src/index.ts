import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";

import { loadConfig } from "./config.js";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import stripePlugin from "./plugins/stripe.js";

// Routes — Health
import { healthRoutes } from "./routes/health.js";

// Routes — Plans
import { listPlansRoute } from "./routes/plans/list.js";

// Routes — Subscriptions
import { createSubscriptionRoute } from "./routes/subscriptions/create.js";
import { getSubscriptionRoute } from "./routes/subscriptions/get.js";
import { cancelSubscriptionRoute } from "./routes/subscriptions/cancel.js";
import { reactivateSubscriptionRoute } from "./routes/subscriptions/reactivate.js";
import { updatePaymentRoute } from "./routes/subscriptions/update-payment.js";

// Routes — Addons
import { subscribeAddonRoute } from "./routes/addons/subscribe.js";
import { cancelAddonRoute } from "./routes/addons/cancel.js";
import { listAddonsRoute } from "./routes/addons/list.js";

// Routes — B2B
import { createContractRoute } from "./routes/b2b/create-contract.js";
import { addSeatsRoute } from "./routes/b2b/add-seats.js";
import { contractUsageRoute } from "./routes/b2b/usage.js";
import { b2bInvoiceRoute } from "./routes/b2b/invoice.js";

// Routes — Webhooks
import { stripeWebhookRoute } from "./routes/webhooks/stripe.js";

// Routes — Invoices
import { listInvoicesRoute } from "./routes/invoices/list.js";
import { downloadInvoiceRoute } from "./routes/invoices/download.js";

// Events
import { setupSubscribers } from "./events/subscribers.js";

// Cron
import { setupGracePeriodExpiryCron } from "./cron/grace-period-expiry.js";
import { setupGracePeriodWarningCron } from "./cron/grace-period-warning.js";
import { setupDataDeletionTriggerCron } from "./cron/data-deletion-trigger.js";
import { setupDunningRetryCron } from "./cron/dunning-retry.js";

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
    origin: config.APP_URL,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Infrastructure plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(stripePlugin);

  // Register routes
  await app.register(healthRoutes);
  await app.register(listPlansRoute);
  await app.register(createSubscriptionRoute);
  await app.register(getSubscriptionRoute);
  await app.register(cancelSubscriptionRoute);
  await app.register(reactivateSubscriptionRoute);
  await app.register(updatePaymentRoute);
  await app.register(subscribeAddonRoute);
  await app.register(cancelAddonRoute);
  await app.register(listAddonsRoute);
  await app.register(createContractRoute);
  await app.register(addSeatsRoute);
  await app.register(contractUsageRoute);
  await app.register(b2bInvoiceRoute);
  await app.register(stripeWebhookRoute);
  await app.register(listInvoicesRoute);
  await app.register(downloadInvoiceRoute);

  // Set up NATS event subscribers
  await setupSubscribers(app);

  // Set up cron jobs
  const cronTasks = [
    setupGracePeriodExpiryCron(app),
    setupGracePeriodWarningCron(app),
    setupDataDeletionTriggerCron(app),
    setupDunningRetryCron(app),
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
  app.log.info(`billing-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
