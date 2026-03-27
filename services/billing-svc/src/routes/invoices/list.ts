import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { InvoiceService } from "../../services/invoice.service.js";

export async function listInvoicesRoute(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { tenantId: string } }>("/billing/invoices/:tenantId", { preHandler: [authenticate] }, async (request, reply) => {
    const service = new InvoiceService(app);
    const invoices = await service.listInvoices(request.params.tenantId);
    return reply.send({ invoices });
  });
}
