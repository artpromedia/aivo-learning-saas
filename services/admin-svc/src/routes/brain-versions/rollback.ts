import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { BrainVersionService } from "../../services/brain-version.service.js";

export async function rollbackBrainVersionRoute(app: FastifyInstance) {
  app.post(
    "/admin/brain-versions/:id/rollback",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { reason?: string } | undefined;

      const service = new BrainVersionService(app);
      const result = await service.rollback(id, request.user.sub, body?.reason, request.ip);
      return reply.send(result);
    },
  );
}
