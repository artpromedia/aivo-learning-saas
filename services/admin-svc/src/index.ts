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
import brainClientPlugin from "./plugins/brain-client.js";

// Routes — Health
import { healthRoutes } from "./routes/health.js";

// Routes — Tenants
import { listTenantsRoute } from "./routes/tenants/list.js";
import { getTenantRoute } from "./routes/tenants/get.js";
import { createTenantRoute } from "./routes/tenants/create.js";
import { updateTenantRoute } from "./routes/tenants/update.js";
import { suspendTenantRoute } from "./routes/tenants/suspend.js";
import { tenantConfigRoute } from "./routes/tenants/config.js";

// Routes — Brain Versions
import { listBrainVersionsRoute } from "./routes/brain-versions/list.js";
import { createBrainVersionRoute } from "./routes/brain-versions/create.js";
import { rolloutBrainVersionRoute } from "./routes/brain-versions/rollout.js";
import { rolloutStatusRoute } from "./routes/brain-versions/status.js";
import { rollbackBrainVersionRoute } from "./routes/brain-versions/rollback.js";

// Routes — Analytics
import { analyticsOverviewRoute } from "./routes/analytics/overview.js";
import { analyticsLearnersRoute } from "./routes/analytics/learners.js";
import { analyticsBrainsRoute } from "./routes/analytics/brains.js";
import { analyticsRevenueRoute } from "./routes/analytics/revenue.js";
import { analyticsEngagementRoute } from "./routes/analytics/engagement.js";
import { analyticsTutorsRoute } from "./routes/analytics/tutors.js";
import { analyticsLlmUsageRoute } from "./routes/analytics/llm-usage.js";

// Routes — Feature Flags
import { listFeatureFlagsRoute } from "./routes/feature-flags/list.js";
import { createFeatureFlagRoute } from "./routes/feature-flags/create.js";
import { updateFeatureFlagRoute } from "./routes/feature-flags/update.js";
import { tenantOverrideRoute } from "./routes/feature-flags/tenant-override.js";

// Routes — Leads
import { listLeadsRoute } from "./routes/leads/list.js";
import { createLeadRoute } from "./routes/leads/create.js";
import { updateLeadRoute } from "./routes/leads/update.js";
import { leadNotesRoute } from "./routes/leads/notes.js";
import { convertLeadRoute } from "./routes/leads/convert.js";

// Routes — Audit
import { auditLogRoute } from "./routes/audit/log.js";

// Events
import { setupSubscribers } from "./events/subscribers.js";

// Cron
import { startAnalyticsCacheCron } from "./cron/analytics-cache.js";
import { startBrainRolloutMonitorCron } from "./cron/brain-rollout-monitor.js";
import { startLeadNurtureCron } from "./cron/lead-nurture-trigger.js";

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
    max: 200,
    timeWindow: "1 minute",
  });

  // Infrastructure plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(brainClientPlugin);

  // Register routes
  await app.register(healthRoutes);

  // Tenants
  await app.register(listTenantsRoute);
  await app.register(getTenantRoute);
  await app.register(createTenantRoute);
  await app.register(updateTenantRoute);
  await app.register(suspendTenantRoute);
  await app.register(tenantConfigRoute);

  // Brain Versions
  await app.register(listBrainVersionsRoute);
  await app.register(createBrainVersionRoute);
  await app.register(rolloutBrainVersionRoute);
  await app.register(rolloutStatusRoute);
  await app.register(rollbackBrainVersionRoute);

  // Analytics
  await app.register(analyticsOverviewRoute);
  await app.register(analyticsLearnersRoute);
  await app.register(analyticsBrainsRoute);
  await app.register(analyticsRevenueRoute);
  await app.register(analyticsEngagementRoute);
  await app.register(analyticsTutorsRoute);
  await app.register(analyticsLlmUsageRoute);

  // Feature Flags
  await app.register(listFeatureFlagsRoute);
  await app.register(createFeatureFlagRoute);
  await app.register(updateFeatureFlagRoute);
  await app.register(tenantOverrideRoute);

  // Leads
  await app.register(listLeadsRoute);
  await app.register(createLeadRoute);
  await app.register(updateLeadRoute);
  await app.register(leadNotesRoute);
  await app.register(convertLeadRoute);

  // Audit
  await app.register(auditLogRoute);

  // Event subscribers
  await setupSubscribers(app);

  // Cron jobs
  startAnalyticsCacheCron(app);
  startBrainRolloutMonitorCron(app);
  startLeadNurtureCron(app);

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`admin-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
