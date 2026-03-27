import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "learning-svc" }));
  app.get("/ready", async () => ({ status: "ready" }));
}
