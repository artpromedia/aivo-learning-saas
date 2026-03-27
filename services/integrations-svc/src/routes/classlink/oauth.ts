import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { ClassLinkService } from "../../services/classlink.service.js";

export async function classLinkOAuthRoute(app: FastifyInstance) {
  app.get(
    "/integrations/classlink/auth",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const service = new ClassLinkService(app);
      const authUrl = service.getAuthUrl(request.user.tenantId);
      return reply.redirect(authUrl);
    },
  );
}
