import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { BrainVersionService } from "../../services/brain-version.service.js";

export async function rolloutBrainVersionRoute(app: FastifyInstance) {
  app.post(
    "/admin/brain-versions/:id/rollout",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { advance?: boolean } | undefined;

      const service = new BrainVersionService(app);

      if (body?.advance) {
        const rollout = await service.advanceRollout(id, request.user.sub, request.ip);
        return reply.send({ rollout });
      }

      const rollout = await service.startRollout(id, request.user.sub, request.ip);
      return reply.status(201).send({ rollout });
    },
  );
}
