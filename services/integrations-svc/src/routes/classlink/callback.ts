import type { FastifyInstance } from "fastify";
import { ClassLinkService } from "../../services/classlink.service.js";
import { getConfig } from "../../config.js";

export async function classLinkCallbackRoute(app: FastifyInstance) {
  app.get(
    "/integrations/classlink/callback",
    async (request, reply) => {
      const { code, state } = request.query as { code: string; state: string };
      const service = new ClassLinkService(app);
      await service.handleCallback(code, state);
      const config = getConfig();
      return reply.redirect(config.APP_URL);
    },
  );
}
