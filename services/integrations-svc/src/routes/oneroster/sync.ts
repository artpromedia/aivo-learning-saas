import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { OneRosterService } from "../../services/oneroster.service.js";

export async function oneRosterSyncRoute(app: FastifyInstance) {
  app.post(
    "/integrations/oneroster/sync",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const service = new OneRosterService(app);
      const jobId = await service.triggerSync(request.user.tenantId);
      return reply.send({ jobId });
    },
  );
}
