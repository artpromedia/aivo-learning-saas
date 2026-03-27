import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { TenantService } from "../../services/tenant.service.js";

export async function updateTenantRoute(app: FastifyInstance) {
  app.patch(
    "/admin/tenants/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        name?: string;
        planId?: string;
        settings?: Record<string, unknown>;
      };

      const tenantService = new TenantService(app);
      const tenant = await tenantService.update(id, body, request.user.sub, request.ip);
      return reply.send({ tenant });
    },
  );
}
