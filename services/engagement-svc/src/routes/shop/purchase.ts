import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ShopService } from "../../services/shop.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  itemId: z.string().min(1),
});

export async function shopPurchaseRoute(app: FastifyInstance) {
  app.post("/engagement/shop/purchase", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId, itemId } = bodySchema.parse(request.body);
    const service = new ShopService(app);
    const result = await service.purchase(learnerId, itemId);
    if (!result.success) {
      return reply.status(400).send({ error: result.error });
    }
    return reply.send(result);
  });
}
