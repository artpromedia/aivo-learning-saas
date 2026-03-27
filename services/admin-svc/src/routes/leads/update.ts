import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { LeadService } from "../../services/lead.service.js";

export async function updateLeadRoute(app: FastifyInstance) {
  app.patch(
    "/admin/leads/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        stage?: string;
        assignedTo?: string;
        organizationName?: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
        districtSize?: number;
        metadata?: Record<string, unknown>;
      };

      const service = new LeadService(app);
      const lead = await service.update(id, body as any, request.user.sub, request.ip);
      return reply.send({ lead });
    },
  );
}
