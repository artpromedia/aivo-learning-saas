import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { BrainVersionService } from "../../services/brain-version.service.js";

export async function listBrainVersionsRoute(app: FastifyInstance) {
  app.get(
    "/admin/brain-versions",
    { preHandler: [authenticate, adminOnly] },
    async (_request, reply) => {
      const service = new BrainVersionService(app);
      const versions = await service.list();
      return reply.send({ versions });
    },
  );
}
