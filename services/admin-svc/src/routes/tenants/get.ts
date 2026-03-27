import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { TenantService } from "../../services/tenant.service.js";

export async function getTenantRoute(app: FastifyInstance) {
  app.get(
    "/admin/tenants/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const tenantService = new TenantService(app);
      const tenant = await tenantService.getById(id);
      return reply.send({ tenant });
    },
  );
}
