import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { TenantService } from "../../services/tenant.service.js";

const updateTenantBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  settings: z.record(z.unknown()).optional(),
});

export async function updateTenantRoute(app: FastifyInstance) {
  app.patch<{ Params: { id: string } }>(
    "/tenants/:id",
    { preHandler: [authenticate, authorize("PARENT", "DISTRICT_ADMIN", "PLATFORM_ADMIN"), tenantContext] },
    async (request, reply) => {
      const body = updateTenantBodySchema.parse(request.body);
      const tenantService = new TenantService(app);
      const tenant = await tenantService.update(request.params.id, request.tenantId, body);

      return reply.status(200).send({ tenant });
    },
  );
}
