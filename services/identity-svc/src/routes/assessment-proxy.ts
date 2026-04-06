import type { FastifyPluginAsync } from "fastify";

const ASSESSMENT_SVC_URL =
  process.env.ASSESSMENT_SVC_URL ?? "http://localhost:3012";

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
  // Accept multipart/form-data as raw buffer for forwarding to assessment-svc
  app.addContentTypeParser(
    "multipart/form-data",
    function (_req, payload, done) {
      const chunks: Buffer[] = [];
      payload.on("data", (chunk: Buffer) => chunks.push(chunk));
      payload.on("end", () => done(null, Buffer.concat(chunks)));
      payload.on("error", done);
    },
  );

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

      // Handle multipart (file upload) — forward raw body
      if (contentType?.includes("multipart/form-data") && Buffer.isBuffer(request.body)) {
        const headers: Record<string, string> = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        if (contentType) headers["Content-Type"] = contentType;

        const res = await fetch(`${ASSESSMENT_SVC_URL}${path}`, {
          method,
          headers,
          body: request.body,
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
