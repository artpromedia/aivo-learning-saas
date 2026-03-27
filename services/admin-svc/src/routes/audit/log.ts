import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { AuditService } from "../../services/audit.service.js";

export async function auditLogRoute(app: FastifyInstance) {
  app.get(
    "/admin/audit/log",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const query = request.query as {
        page?: string;
        limit?: string;
        adminUserId?: string;
        action?: string;
        resourceType?: string;
        startDate?: string;
        endDate?: string;
      };

      const service = new AuditService(app);
      const result = await service.query({
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        adminUserId: query.adminUserId,
        action: query.action,
        resourceType: query.resourceType,
        startDate: query.startDate,
        endDate: query.endDate,
      });

      return reply.send(result);
    },
  );
}
