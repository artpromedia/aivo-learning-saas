import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { initTracing } from "./tracer.js";
import { initSentry, sentryErrorHook } from "./sentry.js";
import { createMetrics, metricsEndpoint, createMetricsHook } from "./metrics.js";
import { createLogger } from "./logger.js";
import type { NodeSDK } from "@opentelemetry/sdk-node";

export interface ObservabilityOptions {
  serviceName: string;
  environment?: string;
  sentryDsn?: string;
}

export const observabilityPlugin = fp(
  async (app: FastifyInstance, opts: ObservabilityOptions) => {
    const environment = opts.environment ?? process.env["NODE_ENV"] ?? "development";

    const sdk: NodeSDK = initTracing({
      serviceName: opts.serviceName,
      environment,
    });

    if (opts.sentryDsn) {
      initSentry({
        dsn: opts.sentryDsn,
        serviceName: opts.serviceName,
        environment,
      });
    }

    const logger = createLogger({
      serviceName: opts.serviceName,
      environment,
    });

    const metrics = createMetrics({
      serviceName: opts.serviceName,
    });

    const hooks = createMetricsHook(metrics);

    app.addHook("onRequest", hooks.onRequest);
    app.addHook("onResponse", hooks.onResponse);

    if (opts.sentryDsn) {
      app.addHook("onError", sentryErrorHook);
    }

    app.get("/metrics", metricsEndpoint);

    app.decorate("observability", {
      logger,
      metrics,
      sdk,
    });

    app.addHook("onClose", async () => {
      await sdk.shutdown();
    });
  },
  {
    fastify: ">=5.0.0",
    name: "@aivo/observability",
  },
);
