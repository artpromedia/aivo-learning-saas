import type { FastifyInstance } from "fastify";
import { loadConfig } from "../config.js";
import { getToken } from "./proxy-utils.js";

export async function teacherProxyRoutes(app: FastifyInstance) {
  const config = loadConfig();
  const ADMIN_SVC_URL = config.ADMIN_SVC_URL;

  async function proxyToAdmin(
    path: string,
    token: string | undefined,
    method = "GET",
    body?: string,
  ): Promise<{ status: number; data: unknown }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${ADMIN_SVC_URL}${path}`, {
        method,
        headers,
        body: method === "GET" ? undefined : body,
      });
      const data = await res.json().catch(() => null);
      return { status: res.status, data };
    } catch {
      return { status: 502, data: { error: "Admin service unavailable" } };
    }
  }

  app.get("/teacher/classrooms", async (request, reply) => {
    const token = getToken(request as any);
    const { status, data } = await proxyToAdmin(
      "/admin/classrooms",
      token,
    );
    if (status !== 200) return reply.status(status).send(data);
    return reply.send(data);
  });

  app.get<{ Params: { id: string } }>(
    "/teacher/classrooms/:id",
    async (request, reply) => {
      const token = getToken(request as any);
      const { id } = request.params;
      const { status, data } = await proxyToAdmin(
        `/admin/classrooms/${id}`,
        token,
      );
      if (status !== 200) return reply.status(status).send(data);
      return reply.send(data);
    },
  );
}
