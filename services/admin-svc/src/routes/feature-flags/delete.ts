import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { FeatureFlagService } from "../../services/feature-flag.service.js";

export async function deleteFeatureFlagRoute(app: FastifyInstance) {
  app.delete(
    "/admin/feature-flags/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const service = new FeatureFlagService(app);
      await service.delete(id, request.user.sub, request.ip);

      return reply.status(204).send();
    },
  );
}
