import type { FastifyInstance } from "fastify";
import { CleverService } from "../../services/clever.service.js";
import { getConfig } from "../../config.js";

export async function cleverCallbackRoute(app: FastifyInstance) {
  app.get(
    "/integrations/clever/callback",
    async (request, reply) => {
      const { code, state } = request.query as { code: string; state: string };
      const service = new CleverService(app);
      await service.handleCallback(code, state);
      const config = getConfig();
      return reply.redirect(config.APP_URL);
    },
  );
}
