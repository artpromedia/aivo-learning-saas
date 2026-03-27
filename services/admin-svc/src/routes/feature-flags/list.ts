import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { FeatureFlagService } from "../../services/feature-flag.service.js";

export async function listFeatureFlagsRoute(app: FastifyInstance) {
  app.get(
    "/admin/feature-flags",
    { preHandler: [authenticate, adminOnly] },
    async (_request, reply) => {
      const service = new FeatureFlagService(app);
      const flags = await service.list();
      return reply.send({ flags });
    },
  );
}
