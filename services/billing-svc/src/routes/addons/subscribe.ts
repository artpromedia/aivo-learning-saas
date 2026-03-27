import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { AddonService } from "../../services/addon.service.js";

const subscribeAddonBodySchema = z.object({
  learnerId: z.string().uuid(),
  sku: z.string().min(1),
});

export async function subscribeAddonRoute(app: FastifyInstance) {
  app.post("/billing/addons/subscribe", { preHandler: [authenticate] }, async (request, reply) => {
    const body = subscribeAddonBodySchema.parse(request.body);
    const addonService = new AddonService(app);

    await addonService.subscribeAddon(request.user.tenantId, body.learnerId, body.sku);

    return reply.status(201).send({
      message: "Addon subscription created successfully.",
    });
  });
}
