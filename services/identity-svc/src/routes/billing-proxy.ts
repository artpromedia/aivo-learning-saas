import type { FastifyPluginAsync } from "fastify";

const BILLING_SVC_URL = process.env.BILLING_SVC_URL ?? "http://localhost:3008";

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

  const res = await fetch(`${BILLING_SVC_URL}${path}`, {
    method,
    headers,
    body: method === "GET" ? undefined : body,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

export const billingProxyRoutes: FastifyPluginAsync = async (app) => {
  // Proxy all /api/billing/* requests to billing-svc
  app.all<{ Params: { rest: string } }>("/api/billing/*", async (request, reply) => {
    const path = `/billing/${request.params.rest}`;
    const accessToken =
      request.cookies?.access_token ??
      request.headers.authorization?.replace("Bearer ", "");
    const method = request.method;
    const body = ["GET", "HEAD"].includes(method) ? undefined : JSON.stringify(request.body);
    const { status, data } = await proxyToBilling(path, accessToken, method, body);
    return reply.status(status).send(data);
  });
};
