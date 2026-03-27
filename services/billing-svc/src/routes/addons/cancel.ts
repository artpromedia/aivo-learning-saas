import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { AddonService } from "../../services/addon.service.js";

export async function cancelAddonRoute(app: FastifyInstance) {
  app.post("/billing/addons/:id/cancel", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const addonService = new AddonService(app);

    await addonService.cancelAddon(id);

    return reply.status(200).send({
      message: "Addon cancelled. You have a 7-day grace period to reactivate.",
    });
  });
}
