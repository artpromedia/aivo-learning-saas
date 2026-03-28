import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/i18n/health", async (_request, reply) => {
    return reply.status(200).send({
      status: "ok",
      service: "i18n-svc",
      timestamp: new Date().toISOString(),
    });
  });
}
