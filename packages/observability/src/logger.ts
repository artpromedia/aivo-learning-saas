import { trace, context } from "@opentelemetry/api";
import pino from "pino";
import type { Logger } from "pino";

export interface LoggerOptions {
  serviceName: string;
  environment?: string;
}

export function createLogger(opts: LoggerOptions): Logger {
  const environment = opts.environment ?? process.env["NODE_ENV"] ?? "development";

  return pino({
    level: environment === "production" ? "info" : "debug",
    formatters: {
      level(label: string) {
        return { level: label };
      },
      log(object: Record<string, unknown>) {
        const activeSpan = trace.getSpan(context.active());
        if (activeSpan) {
          const spanContext = activeSpan.spanContext();
          return {
            ...object,
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          };
        }
        return object;
      },
    },
    base: {
      service_name: opts.serviceName,
      environment,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
