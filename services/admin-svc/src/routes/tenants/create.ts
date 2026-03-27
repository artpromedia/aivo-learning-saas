import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { TenantService } from "../../services/tenant.service.js";

export async function createTenantRoute(app: FastifyInstance) {
  app.post(
    "/admin/tenants",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        type: "B2C_FAMILY" | "B2B_DISTRICT";
        planId?: string;
        settings?: Record<string, unknown>;
      };

      if (!body.name || !body.type) {
        return reply.status(400).send({ error: "name and type are required" });
      }

      if (!["B2C_FAMILY", "B2B_DISTRICT"].includes(body.type)) {
        return reply.status(400).send({ error: "type must be B2C_FAMILY or B2B_DISTRICT" });
      }

      const tenantService = new TenantService(app);
      const tenant = await tenantService.create(
        body,
        request.user.sub,
        request.ip,
      );

      return reply.status(201).send({ tenant });
    },
  );
}
