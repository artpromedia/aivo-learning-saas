import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { FeatureFlagService } from "../../services/feature-flag.service.js";

export async function tenantOverrideRoute(app: FastifyInstance) {
  app.post(
    "/admin/feature-flags/:id/tenant-override",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        tenantId: string;
        value: unknown;
      };

      if (!body.tenantId) {
        return reply.status(400).send({ error: "tenantId is required" });
      }

      const service = new FeatureFlagService(app);
      const override = await service.setTenantOverride(id, body, request.user.sub, request.ip);
      return reply.send({ override });
    },
  );
}
