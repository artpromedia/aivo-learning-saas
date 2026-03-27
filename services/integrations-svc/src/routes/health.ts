import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "healthy",
    service: "integrations-svc",
    timestamp: new Date().toISOString(),
  }));
}
