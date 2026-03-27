import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { BrainVersionService } from "../../services/brain-version.service.js";

export async function createBrainVersionRoute(app: FastifyInstance) {
  app.post(
    "/admin/brain-versions",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = request.body as {
        version: string;
        changelog: string;
        seedTemplatesUpdated?: boolean;
      };

      if (!body.version || !body.changelog) {
        return reply.status(400).send({ error: "version and changelog are required" });
      }

      const service = new BrainVersionService(app);
      const version = await service.create(body, request.user.sub, request.ip);
      return reply.status(201).send({ version });
    },
  );
}
