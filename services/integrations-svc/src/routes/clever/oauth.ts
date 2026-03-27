import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { CleverService } from "../../services/clever.service.js";

export async function cleverOAuthRoute(app: FastifyInstance) {
  app.get(
    "/integrations/clever/auth",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const service = new CleverService(app);
      const authUrl = service.getAuthUrl(request.user.tenantId);
      return reply.redirect(authUrl);
    },
  );
}
