import type { FastifyPluginAsync } from "fastify";
import { loadConfig } from "../config.js";

const { ASSESSMENT_SVC_URL } = loadConfig();

async function proxyToAssessment(
  path: string,
  accessToken: string | undefined,
  method: string,
  body?: string,
  contentType?: string,
): Promise<{ status: number; data: unknown; resContentType: string | null }> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (contentType) {
    headers["Content-Type"] = contentType;
  } else if (body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${ASSESSMENT_SVC_URL}${path}`, {
    method,
    headers,
    body: ["GET", "HEAD"].includes(method) ? undefined : body,
  });

  const resContentType = res.headers.get("content-type");
  const data = await res.json().catch(() => null);
  return { status: res.status, data, resContentType };
}

export const assessmentProxyRoutes: FastifyPluginAsync = async (app) => {
  // Proxy all /api/assessment/* requests to assessment-svc
  app.all<{ Params: { "*": string } }>(
    "/assessment/*",
    async (request, reply) => {
      const rest = (request.params as Record<string, string>)["*"];
      const path = `/assessment/${rest}`;
      const accessToken =
        request.cookies?.access_token ??
        request.headers.authorization?.replace("Bearer ", "");
      const method = request.method;
      const contentType = request.headers["content-type"];

      // Handle multipart (file upload) — collect raw body from stream and forward
      if (contentType?.includes("multipart/form-data")) {
        const chunks: Buffer[] = [];
        for await (const chunk of request.raw) {
          chunks.push(chunk as Buffer);
        }
        const rawBody = Buffer.concat(chunks);

        const headers: Record<string, string> = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        if (contentType) headers["Content-Type"] = contentType;

        const res = await fetch(`${ASSESSMENT_SVC_URL}${path}`, {
          method,
          headers,
          body: rawBody,
        });

        const data = await res.json().catch(() => null);
        return reply.status(res.status).send(data);
      }

      // Handle JSON requests
      const body = ["GET", "HEAD"].includes(method)
        ? undefined
        : JSON.stringify(request.body);
      const { status, data } = await proxyToAssessment(
        path,
        accessToken,
        method,
        body,
        contentType,
      );
      return reply.status(status).send(data);
    },
  );
};
