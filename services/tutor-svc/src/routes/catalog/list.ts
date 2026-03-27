import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { CatalogService } from "../../services/catalog.service.js";

export async function listCatalogRoute(app: FastifyInstance) {
  app.get(
    "/tutors/catalog",
    { preHandler: [authenticate] },
    async (request) => {
      const learnerId = (request.query as { learnerId?: string }).learnerId;
      const catalog = new CatalogService(app);
      const items = await catalog.getCatalog(learnerId);
      return { catalog: items };
    },
  );
}
