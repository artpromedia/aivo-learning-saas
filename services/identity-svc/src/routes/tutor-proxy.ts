import type { FastifyPluginAsync } from "fastify";

const TUTOR_SVC_URL = process.env.TUTOR_SVC_URL ?? "http://localhost:3006";

async function proxyToTutor(
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
    const res = await fetch(`${TUTOR_SVC_URL}${path}`, {
      method,
      headers,
      body: method === "GET" ? undefined : body,
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 502, data: { error: "Tutor service unavailable" } };
  }
}

export const tutorProxyRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/tutors → tutor-svc GET /tutors/subscriptions
  app.get("/tutors", async (request, reply) => {
    const accessToken =
      request.cookies?.access_token ??
      request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToTutor("/tutors/subscriptions", accessToken);
    return reply.status(status).send(data);
  });

  // GET /api/tutors/store → tutor-svc GET /tutors/catalog
  app.get("/tutors/store", async (request, reply) => {
    const accessToken =
      request.cookies?.access_token ??
      request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToTutor("/tutors/catalog", accessToken);
    return reply.status(status).send(data);
  });

  // Catch-all: proxy all other /api/tutors/* requests to tutor-svc /tutors/*
  app.all<{ Params: { "*": string } }>("/tutors/*", async (request, reply) => {
    const rest = (request.params as Record<string, string>)["*"];
    const path = `/tutors/${rest}`;
    const accessToken =
      request.cookies?.access_token ??
      request.headers.authorization?.replace("Bearer ", "");
    const method = request.method;
    const body = ["GET", "HEAD"].includes(method) ? undefined : JSON.stringify(request.body);
    const { status, data } = await proxyToTutor(path, accessToken, method, body);
    return reply.status(status).send(data);
  });
};
