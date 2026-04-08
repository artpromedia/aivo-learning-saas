import type { FastifyPluginAsync } from "fastify";
import { loadConfig } from "../config.js";
import { getQueryString } from "./proxy-utils.js";

const { BILLING_SVC_URL } = loadConfig();

async function proxyToBilling(
  path: string,
  accessToken: string | undefined,
  method = "GET",
  body?: string,
  extraHeaders?: Record<string, string>,
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(`${BILLING_SVC_URL}${path}`, {
      method,
      headers,
      body: method === "GET" ? undefined : body,
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 502, data: { error: "Billing service unavailable" } };
  }
}

export const billingProxyRoutes: FastifyPluginAsync = async (app) => {
  // Proxy all /api/billing/* requests to billing-svc, preserving query strings
  app.all<{ Params: { "*": string } }>("/billing/*", async (request, reply) => {
    const rest = (request.params as Record<string, string>)["*"];
    const queryString = getQueryString(request.url);
    const path = `/billing/${rest}${queryString}`;
    const accessToken =
      request.cookies?.access_token ??
      request.headers.authorization?.replace("Bearer ", "");
    const method = request.method;

    // For Stripe webhook, pass raw body and stripe-signature header through
    const isWebhook = rest.startsWith("webhooks/stripe");
    const extraHeaders: Record<string, string> = {};
    let body: string | undefined;

    if (["GET", "HEAD"].includes(method)) {
      body = undefined;
    } else if (isWebhook && (request as any).rawBody) {
      body = (request as any).rawBody;
      const sig = request.headers["stripe-signature"];
      if (sig) {
        extraHeaders["stripe-signature"] = Array.isArray(sig) ? sig[0] : sig;
      }
    } else {
      body = JSON.stringify(request.body);
    }

    const { status, data } = await proxyToBilling(path, accessToken, method, body, extraHeaders);
    return reply.status(status).send(data);
  });
};
