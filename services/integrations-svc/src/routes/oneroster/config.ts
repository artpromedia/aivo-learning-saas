import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { OneRosterService } from "../../services/oneroster.service.js";

export async function oneRosterConfigRoute(app: FastifyInstance) {
  app.patch(
    "/integrations/oneroster/:districtId/config",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { districtId } = request.params as { districtId: string };
      const { baseUrl, clientId, clientSecret } = request.body as {
        baseUrl: string;
        clientId: string;
        clientSecret: string;
      };
      const service = new OneRosterService(app);
      const connectionId = await service.configureConnection(districtId, {
        baseUrl,
        clientId,
        clientSecret,
      });
      return reply.send({ connectionId });
    },
  );
}
