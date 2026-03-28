export { initTracing } from "./tracer.js";
export type { TracingOptions } from "./tracer.js";

export { createMetrics, metricsEndpoint, createMetricsHook } from "./metrics.js";
export type { Metrics, MetricsOptions } from "./metrics.js";

export { initSentry, sentryErrorHook } from "./sentry.js";
export type { SentryOptions } from "./sentry.js";

export { createLogger } from "./logger.js";
export type { LoggerOptions } from "./logger.js";

export { observabilityPlugin } from "./fastify-plugin.js";
export type { ObservabilityOptions } from "./fastify-plugin.js";
