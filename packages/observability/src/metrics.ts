import client from "prom-client";
import type { FastifyReply, FastifyRequest } from "fastify";

export interface MetricsOptions {
  serviceName: string;
}

export interface Metrics {
  httpRequestsTotal: client.Counter<"method" | "route" | "status_code">;
  httpRequestDurationSeconds: client.Histogram<"method" | "route">;
  httpRequestSizeBytes: client.Histogram<string>;
  natsMessagesPublishedTotal: client.Counter<"subject">;
  natsMessagesReceivedTotal: client.Counter<"subject">;
  llmRequestDurationSeconds: client.Histogram<"provider" | "model">;
  llmTokensUsedTotal: client.Counter<"provider" | "model" | "type">;
}

export function createMetrics(opts: MetricsOptions): Metrics {
  const register = client.register;

  register.setDefaultLabels({ service: opts.serviceName });

  client.collectDefaultMetrics({ register });

  const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"] as const,
    registers: [register],
  });

  const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route"] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
  });

  const httpRequestSizeBytes = new client.Histogram({
    name: "http_request_size_bytes",
    help: "Size of HTTP request bodies in bytes",
    buckets: [100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000],
    registers: [register],
  });

  const natsMessagesPublishedTotal = new client.Counter({
    name: "nats_messages_published_total",
    help: "Total number of NATS messages published",
    labelNames: ["subject"] as const,
    registers: [register],
  });

  const natsMessagesReceivedTotal = new client.Counter({
    name: "nats_messages_received_total",
    help: "Total number of NATS messages received",
    labelNames: ["subject"] as const,
    registers: [register],
  });

  const llmRequestDurationSeconds = new client.Histogram({
    name: "llm_request_duration_seconds",
    help: "Duration of LLM API requests in seconds",
    labelNames: ["provider", "model"] as const,
    buckets: [0.1, 0.5, 1, 2.5, 5, 10, 30, 60, 120],
    registers: [register],
  });

  const llmTokensUsedTotal = new client.Counter({
    name: "llm_tokens_used_total",
    help: "Total number of LLM tokens used",
    labelNames: ["provider", "model", "type"] as const,
    registers: [register],
  });

  return {
    httpRequestsTotal,
    httpRequestDurationSeconds,
    httpRequestSizeBytes,
    natsMessagesPublishedTotal,
    natsMessagesReceivedTotal,
    llmRequestDurationSeconds,
    llmTokensUsedTotal,
  };
}

export async function metricsEndpoint(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const metricsOutput = await client.register.metrics();
  reply.header("Content-Type", client.register.contentType);
  reply.send(metricsOutput);
}

const REQUEST_START_TIME = Symbol("requestStartTime");

interface TimedRequest extends FastifyRequest {
  [REQUEST_START_TIME]?: [number, number];
}

export function createMetricsHook(metrics: Metrics) {
  return {
    onRequest(request: FastifyRequest, _reply: FastifyReply, done: () => void) {
      (request as TimedRequest)[REQUEST_START_TIME] = process.hrtime();
      done();
    },

    onResponse(
      request: FastifyRequest,
      reply: FastifyReply,
      done: () => void,
    ) {
      const startTime = (request as TimedRequest)[REQUEST_START_TIME];
      if (startTime) {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds + nanoseconds / 1e9;

        const route = request.routeOptions?.url ?? request.url;
        const method = request.method;
        const statusCode = String(reply.statusCode);

        metrics.httpRequestDurationSeconds
          .labels({ method, route })
          .observe(duration);

        metrics.httpRequestsTotal
          .labels({ method, route, status_code: statusCode })
          .inc();

        const contentLength = request.headers["content-length"];
        if (contentLength) {
          const size = parseInt(contentLength, 10);
          if (!Number.isNaN(size)) {
            metrics.httpRequestSizeBytes.observe(size);
          }
        }
      }

      done();
    },
  };
}
