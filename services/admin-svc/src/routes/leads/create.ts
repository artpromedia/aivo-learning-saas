import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { LeadService } from "../../services/lead.service.js";

export async function createLeadRoute(app: FastifyInstance) {
  app.post(
    "/admin/leads",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = request.body as {
        organizationName: string;
        contactName: string;
        contactEmail: string;
        contactPhone?: string;
        districtSize?: number;
        source?: string;
        metadata?: Record<string, unknown>;
      };

      if (!body.organizationName || !body.contactName || !body.contactEmail) {
        return reply.status(400).send({
          error: "organizationName, contactName, and contactEmail are required",
        });
      }

      const service = new LeadService(app);
      const lead = await service.create(body, request.user.sub, request.ip);
      return reply.status(201).send({ lead });
    },
  );
}
