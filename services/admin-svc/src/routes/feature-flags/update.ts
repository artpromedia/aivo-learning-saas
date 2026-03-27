import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { FeatureFlagService } from "../../services/feature-flag.service.js";

export async function updateFeatureFlagRoute(app: FastifyInstance) {
  app.patch(
    "/admin/feature-flags/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        description?: string;
        defaultValue?: unknown;
        enabled?: boolean;
      };

      const service = new FeatureFlagService(app);
      const flag = await service.update(id, body, request.user.sub, request.ip);
      return reply.send({ flag });
    },
  );
}
