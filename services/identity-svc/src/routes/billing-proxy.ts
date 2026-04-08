import type { FastifyPluginAsync } from "fastify";
import { loadConfig } from "../config.js";

const { BILLING_SVC_URL } = loadConfig();

async function proxyToBilling(
  path: string,
  accessToken: string | undefined,
  method = "GET",
  body?: string
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
    const queryString = new URL(request.url, "http://localhost").search;
    const path = `/billing/${rest}${queryString}`;
    const accessToken =
      request.cookies?.access_token ??
      request.headers.authorization?.replace("Bearer ", "");
    const method = request.method;
    const body = ["GET", "HEAD"].includes(method) ? undefined : JSON.stringify(request.body);
    const { status, data } = await proxyToBilling(path, accessToken, method, body);
    return reply.status(status).send(data);
  });
};
