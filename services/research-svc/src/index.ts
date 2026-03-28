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

// Routes — Health
import { healthRoutes } from "./routes/health.js";

// Routes — Cohorts
import { createCohortRoute } from "./routes/cohorts/create.js";
import { listCohortsRoute } from "./routes/cohorts/list.js";
import { getCohortRoute } from "./routes/cohorts/get.js";
import { deleteCohortRoute } from "./routes/cohorts/delete.js";

// Routes — Analytics
import { masteryDistributionRoute } from "./routes/analytics/mastery-distribution.js";
import { functioningLevelOutcomesRoute } from "./routes/analytics/functioning-level-outcomes.js";
import { interventionEffectivenessRoute } from "./routes/analytics/intervention-effectiveness.js";
import { accommodationImpactRoute } from "./routes/analytics/accommodation-impact.js";
import { tutorEffectivenessRoute } from "./routes/analytics/tutor-effectiveness.js";
import { populationTrendsRoute } from "./routes/analytics/population-trends.js";

// Routes — Exports
import { createExportRoute } from "./routes/exports/create.js";
import { getExportRoute } from "./routes/exports/get.js";
import { listExportsRoute } from "./routes/exports/list.js";

// Routes — Studies
import { createStudyRoute } from "./routes/studies/create.js";
import { getStudyRoute } from "./routes/studies/get.js";
import { listStudiesRoute } from "./routes/studies/list.js";
import { updateStudyRoute } from "./routes/studies/update.js";

// Workers
import { startWorkers } from "./worker/index.js";

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
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);

  if (config.WORKER_MODE) {
    await startWorkers(app);
    app.log.info("research-svc started in worker mode");
    return app;
  }

  // Core plugins (HTTP mode only)
  await app.register(cookie);
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });

  // Register routes
  await app.register(healthRoutes);

  // Cohorts
  await app.register(createCohortRoute);
  await app.register(listCohortsRoute);
  await app.register(getCohortRoute);
  await app.register(deleteCohortRoute);

  // Analytics
  await app.register(masteryDistributionRoute);
  await app.register(functioningLevelOutcomesRoute);
  await app.register(interventionEffectivenessRoute);
  await app.register(accommodationImpactRoute);
  await app.register(tutorEffectivenessRoute);
  await app.register(populationTrendsRoute);

  // Exports
  await app.register(createExportRoute);
  await app.register(getExportRoute);
  await app.register(listExportsRoute);

  // Studies
  await app.register(createStudyRoute);
  await app.register(getStudyRoute);
  await app.register(listStudiesRoute);
  await app.register(updateStudyRoute);

  return app;
}

const config = loadConfig();
const app = await buildApp();

if (!config.WORKER_MODE) {
  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    app.log.info(`research-svc listening on port ${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
