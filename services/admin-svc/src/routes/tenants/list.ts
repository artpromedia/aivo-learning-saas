import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { TenantService } from "../../services/tenant.service.js";

export async function listTenantsRoute(app: FastifyInstance) {
  app.get(
    "/admin/tenants",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        page?: string;
        limit?: string;
        search?: string;
        type?: string;
        status?: string;
      };

      const tenantService = new TenantService(app);
      const result = await tenantService.list({
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        search: query.search,
        type: query.type as "B2C_FAMILY" | "B2B_DISTRICT" | undefined,
        status: query.status as "ACTIVE" | "SUSPENDED" | "CANCELLED" | undefined,
      });

      return reply.send(result);
    },
  );
}
