import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { CleverService } from "../../services/clever.service.js";

export async function cleverSyncRoute(app: FastifyInstance) {
  app.post(
    "/integrations/clever/sync/:districtId",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { districtId } = request.params as { districtId: string };
      const service = new CleverService(app);
      const jobId = await service.triggerSync(districtId, request.user.tenantId);
      return reply.send({ jobId });
    },
  );
}
