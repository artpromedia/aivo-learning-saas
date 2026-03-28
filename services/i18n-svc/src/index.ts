import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { ZodError } from "zod";

import { loadConfig } from "./config.js";
import { observabilityPlugin } from "@aivo/observability";

import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";

import { healthRoutes } from "./routes/health.js";
import { localeRoutes } from "./routes/locales.js";
import { translationRoutes } from "./routes/translations.js";
import { exportRoutes } from "./routes/export.js";
import { importRoutes } from "./routes/import.js";
import { translateRoutes } from "./routes/translate.js";
import { seedRoutes } from "./routes/seed.js";

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

  await app.register(cors, {
    origin: config.APP_URL,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  await app.register(dbPlugin);
  await app.register(natsPlugin);

  await app.register(observabilityPlugin, {
    serviceName: 'i18n-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });

  await app.register(healthRoutes);
  await app.register(localeRoutes);
  await app.register(translationRoutes);
  await app.register(exportRoutes);
  await app.register(importRoutes);
  await app.register(translateRoutes);
  await app.register(seedRoutes);

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`i18n-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
