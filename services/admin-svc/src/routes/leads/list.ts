import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { LeadService } from "../../services/lead.service.js";

export async function listLeadsRoute(app: FastifyInstance) {
  app.get(
    "/admin/leads",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        page?: string;
        limit?: string;
        stage?: string;
        assignedTo?: string;
      };

      const service = new LeadService(app);
      const result = await service.list({
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        stage: query.stage as any,
        assignedTo: query.assignedTo,
      });

      return reply.send(result);
    },
  );
}
