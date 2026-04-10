import type { FastifyInstance } from "fastify";
import { loadConfig } from "../config.js";
import { getToken } from "./proxy-utils.js";

export async function familyProxyRoutes(app: FastifyInstance) {
  const config = loadConfig();
  const FAMILY_SVC_URL = config.FAMILY_SVC_URL;

  app.all("/family/*", async (request, reply) => {
    const targetPath = request.url; // preserves /family/... and query string
    const targetUrl = `${FAMILY_SVC_URL}${targetPath}`;

    const headers: Record<string, string> = {
      "content-type": request.headers["content-type"] ?? "application/json",
    };
    const token = getToken(request as any);
    if (token) {
      headers.authorization = `Bearer ${token}`;
    } else if (request.headers.authorization) {
      headers.authorization = request.headers.authorization;
    }
    if (request.headers["x-test-run"]) {
      headers["x-test-run"] = request.headers["x-test-run"] as string;
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (
      request.method !== "GET" &&
      request.method !== "HEAD" &&
      request.body
    ) {
      fetchOptions.body =
        typeof request.body === "string"
          ? request.body
          : JSON.stringify(request.body);
    }

    try {
      const upstream = await fetch(targetUrl, fetchOptions);
      const contentType = upstream.headers.get("content-type") ?? "application/json";
      const body = await upstream.text();

      return reply
        .status(upstream.status)
        .header("content-type", contentType)
        .send(body);
    } catch (err) {
      app.log.error({ err, targetUrl }, "family-proxy: upstream request failed");
      return reply.status(502).send({
        error: "Family service unavailable",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
