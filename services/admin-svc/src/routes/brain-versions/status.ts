import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { BrainVersionService } from "../../services/brain-version.service.js";

export async function rolloutStatusRoute(app: FastifyInstance) {
  app.get(
    "/admin/brain-versions/:id/rollout-status",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const service = new BrainVersionService(app);
      const status = await service.getRolloutStatus(id);
      return reply.send(status);
    },
  );
}
