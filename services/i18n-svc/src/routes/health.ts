import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  const handler = async (_request: unknown, reply: { status: (code: number) => { send: (body: unknown) => unknown } }) => {
    return reply.status(200).send({
      status: "ok",
      service: "i18n-svc",
      timestamp: new Date().toISOString(),
    });
  };

  app.get("/health", handler);
  app.get("/i18n/health", handler);
}
