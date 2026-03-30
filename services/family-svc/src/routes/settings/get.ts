import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { SettingsService } from "../../services/settings.service.js";

export async function getSettingsRoute(app: FastifyInstance) {
  app.get(
    "/family/settings",
    { preHandler: [authenticate, authorize("PARENT", "PLATFORM_ADMIN")] },
    async (request, reply) => {
      const service = new SettingsService(app);
      const settings = await service.getSettings(request.user.sub);
      return reply.send(settings);
    },
  );
}
