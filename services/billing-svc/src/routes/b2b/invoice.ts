import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { B2BService } from "../../services/b2b.service.js";

export async function b2bInvoiceRoute(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { id: string } }>("/billing/b2b/contracts/:id/invoice", {
    preHandler: [authenticate, authorize("DISTRICT_ADMIN", "PLATFORM_ADMIN")],
  }, async (request, reply) => {
    const { id } = request.params;
    const service = new B2BService(app);
    const result = await service.generateInvoice(id, request.user.tenantId);
    return reply.send(result);
  });
}
