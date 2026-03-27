import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ShopService } from "../../services/shop.service.js";

const querySchema = z.object({
  category: z.enum(["hat", "outfit", "pet", "background", "frame", "effect"]).optional(),
  gradeBand: z.string().optional(),
  rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY"]).optional(),
});

export async function shopCatalogRoute(app: FastifyInstance) {
  app.get("/engagement/shop/catalog", { preHandler: [authenticate] }, async (request, reply) => {
    const filters = querySchema.parse(request.query);
    const service = new ShopService(app);
    const items = service.getCatalog(filters);
    return reply.send({ items, total: items.length });
  });
}
