import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { ClassLinkService } from "../../services/classlink.service.js";

export async function classLinkSyncRoute(app: FastifyInstance) {
  app.post(
    "/integrations/classlink/sync/:districtId",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { districtId } = request.params as { districtId: string };
      const service = new ClassLinkService(app);
      const jobId = await service.triggerSync(districtId, request.user.tenantId);
      return reply.send({ jobId });
    },
  );
}
