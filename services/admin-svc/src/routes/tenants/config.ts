import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { TenantService } from "../../services/tenant.service.js";

export async function tenantConfigRoute(app: FastifyInstance) {
  app.get(
    "/admin/tenants/:id/config",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const tenantService = new TenantService(app);
      const config = await tenantService.getConfig(id);
      return reply.send({ config });
    },
  );

  app.patch(
    "/admin/tenants/:id/config",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        dailyLlmTokenQuota?: number;
        maxLearners?: number;
        allowedProviders?: string[];
        featuresEnabled?: Record<string, boolean>;
        subscriptionPlan?: string;
      };

      const tenantService = new TenantService(app);
      const config = await tenantService.updateConfig(id, body, request.user.sub, request.ip);
      return reply.send({ config });
    },
  );
}
