import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { AddonService } from "../../services/addon.service.js";

export async function listAddonsRoute(app: FastifyInstance) {
  app.get("/billing/addons/:tenantId", { preHandler: [authenticate] }, async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const addonService = new AddonService(app);

    const addons = await addonService.listAddons(tenantId);

    return reply.status(200).send({ addons });
  });
}
