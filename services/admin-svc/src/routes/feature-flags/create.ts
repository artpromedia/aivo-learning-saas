import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { FeatureFlagService } from "../../services/feature-flag.service.js";

export async function createFeatureFlagRoute(app: FastifyInstance) {
  app.post(
    "/admin/feature-flags",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = request.body as {
        key: string;
        description?: string;
        type: "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST";
        defaultValue: unknown;
        enabled: boolean;
      };

      if (!body.key || !body.type) {
        return reply.status(400).send({ error: "key and type are required" });
      }

      const service = new FeatureFlagService(app);
      const flag = await service.create(body, request.user.sub, request.ip);
      return reply.status(201).send({ flag });
    },
  );
}
