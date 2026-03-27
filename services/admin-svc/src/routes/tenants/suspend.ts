import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { TenantService } from "../../services/tenant.service.js";

export async function suspendTenantRoute(app: FastifyInstance) {
  app.post(
    "/admin/tenants/:id/suspend",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { reason?: string; reactivate?: boolean } | undefined;

      const tenantService = new TenantService(app);

      if (body?.reactivate) {
        const tenant = await tenantService.reactivate(id, request.user.sub, request.ip);
        return reply.send({ tenant, action: "reactivated" });
      }

      const tenant = await tenantService.suspend(id, request.user.sub, body?.reason, request.ip);
      return reply.send({ tenant, action: "suspended" });
    },
  );
}
