import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    return reply.status(200).send({
      status: "healthy",
      service: "identity-svc",
      timestamp: new Date().toISOString(),
    });
  });
}
