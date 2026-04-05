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

export const notificationsProxyRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/notifications → GET /comms/notifications/:userId on comms-svc
  app.get("/notifications", async (request, reply) => {
    const token = request.cookies.access_token;
    if (!token) {
      return reply.status(401).send({ error: "Not authenticated" });
    }

    let userId: string;
    try {
      const payload = await app.auth.verifyAccessToken(token);
      userId = payload.sub;
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }

    const qs = request.url.includes("?") ? request.url.split("?")[1] : "";
    const path = `/comms/notifications/${userId}${qs ? `?${qs}` : ""}`;
    const { status, data } = await proxyToComms(path, token);
    return reply.status(status).send(data);
  });

  // POST /api/notifications/:id/read → PATCH /comms/notifications/:id/read on comms-svc
  app.post<{ Params: { id: string } }>(
    "/notifications/:id/read",
    async (request, reply) => {
      const token = request.cookies.access_token;
      if (!token) {
        return reply.status(401).send({ error: "Not authenticated" });
      }

      const { id } = request.params;
      const { status, data } = await proxyToComms(
        `/comms/notifications/${id}/read`,
        token,
        "PATCH"
      );
      return reply.status(status).send(data);
    }
  );

  // POST /api/notifications/read-all → PATCH /comms/notifications/read-all on comms-svc
  app.post("/notifications/read-all", async (request, reply) => {
    const token = request.cookies.access_token;
    if (!token) {
      return reply.status(401).send({ error: "Not authenticated" });
    }

    const { status, data } = await proxyToComms(
      "/comms/notifications/read-all",
      token,
      "PATCH"
    );
    return reply.status(status).send(data);
  });
};
