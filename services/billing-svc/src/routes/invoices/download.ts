import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { InvoiceService } from "../../services/invoice.service.js";

export async function downloadInvoiceRoute(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { id: string } }>("/billing/invoices/:id/download", { preHandler: [authenticate] }, async (request, reply) => {
    const service = new InvoiceService(app);
    const downloadUrl = await service.getInvoiceDownloadUrl(request.params.id);
    if (!downloadUrl) {
      return reply.status(404).send({ error: "Invoice not found" });
    }
    return reply.send({ downloadUrl });
  });
}
