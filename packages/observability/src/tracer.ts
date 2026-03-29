import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { IORedisInstrumentation } from "@opentelemetry/instrumentation-ioredis";
import { Resource } from "@opentelemetry/resources";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";

export interface TracingOptions {
  serviceName: string;
  environment?: string;
}

export function initTracing(opts: TracingOptions): NodeSDK {
  const environment = opts.environment ?? process.env["NODE_ENV"] ?? "development";

  const endpoint =
    process.env["OTEL_EXPORTER_OTLP_ENDPOINT"] ?? "http://localhost:4318";

  const defaultSampleRate = environment === "production" ? 0.1 : 1.0;
  const sampleRate = parseFloat(
    process.env["OTEL_TRACES_SAMPLE_RATE"] ?? String(defaultSampleRate),
  );

  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: opts.serviceName,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
  });

  const traceExporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    sampler: new TraceIdRatioBasedSampler(sampleRate),
    instrumentations: [
      new HttpInstrumentation(),
      new PgInstrumentation(),
      new IORedisInstrumentation(),
    ],
  });

  sdk.start();

  return sdk;
}
