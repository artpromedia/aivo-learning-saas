import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { TenantService } from "../../services/tenant.service.js";

export async function getTenantRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    "/tenants/:id",
    { preHandler: [authenticate, tenantContext] },
    async (request, reply) => {
      const tenantService = new TenantService(app);
      const tenant = await tenantService.getById(request.params.id, request.tenantId);

      return reply.status(200).send({ tenant });
    },
  );
}
