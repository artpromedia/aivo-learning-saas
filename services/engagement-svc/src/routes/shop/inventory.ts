import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ShopService } from "../../services/shop.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function shopInventoryRoute(app: FastifyInstance) {
  app.get("/engagement/shop/inventory/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new ShopService(app);
    const items = await service.getInventory(learnerId);
    return reply.send({ items });
  });
}
