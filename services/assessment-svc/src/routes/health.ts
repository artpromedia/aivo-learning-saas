import { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", {
    schema: { tags: ["Health"] },
  }, async () => ({
    status: "healthy",
    service: "assessment-svc",
    timestamp: new Date().toISOString(),
  }));
}
