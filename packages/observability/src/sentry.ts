import * as Sentry from "@sentry/node";
import type { FastifyReply, FastifyRequest, FastifyError } from "fastify";

export interface SentryOptions {
  dsn: string;
  serviceName: string;
  environment?: string;
}

export function initSentry(opts: SentryOptions): void {
  const environment = opts.environment ?? process.env["NODE_ENV"] ?? "development";

  Sentry.init({
    dsn: opts.dsn,
    environment,
    serverName: opts.serviceName,
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
      }

      if (event.breadcrumbs) {
        for (const breadcrumb of event.breadcrumbs) {
          if (breadcrumb.data) {
            delete breadcrumb.data["email"];
            delete breadcrumb.data["username"];
            delete breadcrumb.data["user_email"];
          }
        }
      }

      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        delete breadcrumb.data["email"];
        delete breadcrumb.data["username"];
        delete breadcrumb.data["user_email"];
      }
      return breadcrumb;
    },
  });
}

export function sentryErrorHook(
  request: FastifyRequest,
  _reply: FastifyReply,
  error: FastifyError,
  done: () => void,
): void {
  Sentry.withScope((scope) => {
    scope.setTag("method", request.method);
    scope.setTag("url", request.url);
    scope.setExtra("request_id", request.id);

    if (request.headers["x-request-id"]) {
      scope.setTag("request_id", request.headers["x-request-id"] as string);
    }

    Sentry.captureException(error);
  });

  done();
}
