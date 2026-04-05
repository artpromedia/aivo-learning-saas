import type { FastifyPluginAsync } from "fastify";

const COMMS_SVC_URL = process.env.COMMS_SVC_URL ?? "http://localhost:3007";

async function proxyToComms(
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

  const res = await fetch(`${COMMS_SVC_URL}${path}`, {
    method,
    headers,
    body: method === "GET" ? undefined : body,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function getToken(request: { cookies?: Record<string, string>; headers: { authorization?: string } }): string | undefined {
  return request.cookies?.access_token ??
    request.headers.authorization?.replace("Bearer ", "");
}

export const notificationsProxyRoutes: FastifyPluginAsync = async (app) => {
  // GET /notifications → comms-svc GET /comms/notifications/:userId
  app.get("/notifications", async (request, reply) => {
    const token = getToken(request);
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Decode user ID from JWT
    let userId: string;
    try {
      const payload = await app.auth.verifyAccessToken(token);
      userId = payload.sub;
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }

    const query = request.query as Record<string, string>;
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", query.page);
    if (query.limit) qs.set("limit", query.limit);
    const qsStr = qs.toString() ? `?${qs.toString()}` : "";

    const { status, data } = await proxyToComms(
      `/comms/notifications/${userId}${qsStr}`,
      token
    );
    return reply.status(status).send(data);
  });

  // PATCH /notifications/:id/read → comms-svc PATCH /comms/notifications/:id/read
  app.patch<{ Params: { id: string } }>("/notifications/:id/read", async (request, reply) => {
    const token = getToken(request);
    const { id } = request.params;
    const { status, data } = await proxyToComms(
      `/comms/notifications/${id}/read`,
      token,
      "PATCH"
    );
    return reply.status(status).send(data);
  });

  // PATCH /notifications/read-all → comms-svc PATCH /comms/notifications/read-all
  app.patch("/notifications/read-all", async (request, reply) => {
    const token = getToken(request);
    const { status, data } = await proxyToComms(
      `/comms/notifications/read-all`,
      token,
      "PATCH"
    );
    return reply.status(status).send(data);
  });
};
