import { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", {
    schema: {
      tags: ["Health"],
      response: { 200: { type: "object", properties: { status: { type: "string" }, service: { type: "string" }, timestamp: { type: "string" } } } },
    },
  }, async () => ({
    status: "healthy",
    service: "identity-svc",
    timestamp: new Date().toISOString(),
  }));
}
