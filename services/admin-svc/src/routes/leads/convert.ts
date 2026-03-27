import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { LeadService } from "../../services/lead.service.js";

export async function convertLeadRoute(app: FastifyInstance) {
  app.post(
    "/admin/leads/:id/convert",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const service = new LeadService(app);
      const result = await service.convert(id, request.user.sub, request.ip);
      return reply.status(201).send(result);
    },
  );
}
