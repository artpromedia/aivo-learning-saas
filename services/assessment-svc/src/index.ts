import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { ZodError } from "zod";
import { loadConfig } from "./config.js";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import aiClientPlugin from "./plugins/ai-client.js";

// Routes — Health
import { healthRoutes } from "./routes/health.js";

// Routes — Parent Assessment
import { parentAssessmentRoute } from "./routes/parent/submit.js";

// Routes — IEP
import { iepUploadRoute } from "./routes/iep/upload.js";
import { iepStatusRoute } from "./routes/iep/status.js";
import { iepConfirmRoute } from "./routes/iep/confirm.js";

// Routes — Baseline
import { baselineStartRoute } from "./routes/baseline/start.js";
import { baselineAnswerRoute } from "./routes/baseline/answer.js";
import { baselineCompleteRoute } from "./routes/baseline/complete.js";
import { baselineStatusRoute } from "./routes/baseline/status.js";

// Subscribers
import { setupSubscribers } from "./subscribers/iep-parse.js";

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

  // Multipart support for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  });

  // Infrastructure plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(aiClientPlugin);

  // Health
  await app.register(healthRoutes);

  // Parent assessment
  await app.register(parentAssessmentRoute);

  // IEP routes
  await app.register(iepUploadRoute);
  await app.register(iepStatusRoute);
  await app.register(iepConfirmRoute);

  // Baseline assessment routes
  await app.register(baselineStartRoute);
  await app.register(baselineAnswerRoute);
  await app.register(baselineCompleteRoute);
  await app.register(baselineStatusRoute);

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
  app.log.info(`assessment-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
