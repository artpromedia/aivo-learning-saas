import type { FastifyPluginAsync } from "fastify";
import { loadConfig } from "../config.js";
import { getQueryString, getToken } from "./proxy-utils.js";

const { TUTOR_SVC_URL } = loadConfig();

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

/**
 * Raw proxy that preserves the original Content-Type and streams the raw
 * request body to tutor-svc. Used for multipart/form-data uploads and SSE
 * streaming responses where JSON re-encoding would break the payload.
 */
async function proxyRawToTutor(
  path: string,
  accessToken: string | undefined,
  method: string,
  rawBody: Buffer | undefined,
  contentType: string | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return fetch(`${TUTOR_SVC_URL}${path}`, {
    method,
    headers,
    body: ["GET", "HEAD"].includes(method) ? undefined : rawBody,
  });
}

export const tutorProxyRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/tutors → tutor-svc GET /tutors/subscriptions
  app.get("/tutors", async (request, reply) => {
    const accessToken = getToken(request);
    if (!accessToken) {
      return reply.status(401).send({ error: "Authentication required" });
    }
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToTutor(`/tutors/subscriptions${queryString}`, accessToken);
    return reply.status(status).send(data);
  });

  // GET /api/tutors/store → tutor-svc GET /tutors/catalog
  app.get("/tutors/store", async (request, reply) => {
    const accessToken = getToken(request);
    if (!accessToken) {
      return reply.status(401).send({ error: "Authentication required" });
    }
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToTutor(`/tutors/catalog${queryString}`, accessToken);
    return reply.status(status).send(data);
  });

  // POST /api/tutors/homework/upload — multipart proxy (must be before catch-all)
  app.post("/tutors/homework/upload", async (request, reply) => {
    const accessToken = getToken(request);
    if (!accessToken) {
      return reply.status(401).send({ error: "Authentication required" });
    }
    const queryString = getQueryString(request.url);
    const contentType = request.headers["content-type"];

    try {
      // Collect the raw body from the request
      const chunks: Buffer[] = [];
      for await (const chunk of request.raw) {
        chunks.push(chunk as Buffer);
      }
      const rawBody = Buffer.concat(chunks);

      const res = await proxyRawToTutor(
        `/tutors/homework/upload${queryString}`,
        accessToken,
        "POST",
        rawBody,
        contentType,
      );

      const data = await res.json().catch(() => null);
      return reply.status(res.status).send(data);
    } catch {
      return reply.status(502).send({ error: "Tutor service unavailable" });
    }
  });

  // POST /api/tutors/:sessionId/chat — SSE streaming proxy (must be before catch-all)
  app.post<{ Params: { sessionId: string } }>("/tutors/:sessionId/chat", async (request, reply) => {
    const { sessionId } = request.params;
    const accessToken = getToken(request);
    if (!accessToken) {
      return reply.status(401).send({ error: "Authentication required" });
    }

    try {
      const res = await fetch(`${TUTOR_SVC_URL}/tutors/sessions/${sessionId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(request.body),
      });

      // If upstream returned an error, forward as a normal JSON response
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        return reply.status(res.status).send(data);
      }

      // Stream the SSE response back to the client
      reply.raw.writeHead(200, {
        "Content-Type": res.headers.get("content-type") ?? "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      if (!res.body) {
        reply.raw.end();
        return reply;
      }

      const reader = (res.body as ReadableStream<Uint8Array>).getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reply.raw.write(value);
        }
      } finally {
        reply.raw.end();
      }

      return reply;
    } catch {
      return reply.status(502).send({ error: "Tutor service unavailable" });
    }
  });

  // Catch-all: proxy all other /api/tutors/* requests to tutor-svc /tutors/*
  app.all<{ Params: { "*": string } }>("/tutors/*", async (request, reply) => {
    const rest = (request.params as Record<string, string>)["*"];
    const queryString = getQueryString(request.url);
    const path = `/tutors/${rest}${queryString}`;
    const accessToken = getToken(request);
    if (!accessToken) {
      return reply.status(401).send({ error: "Authentication required" });
    }
    const method = request.method;
    const body = ["GET", "HEAD"].includes(method) ? undefined : JSON.stringify(request.body);
    const { status, data } = await proxyToTutor(path, accessToken, method, body);
    return reply.status(status).send(data);
  });
};
