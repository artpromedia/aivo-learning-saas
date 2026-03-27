import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { WebhookService } from "../../services/webhook.service.js";

export async function webhookDeliveriesRoute(app: FastifyInstance) {
  app.get(
    "/integrations/webhooks/:id/deliveries",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { page, limit } = request.query as { page?: string; limit?: string };
      const { tenantId } = (request as any).user;

      const service = new WebhookService(app);
      const deliveries = await service.getDeliveries(id, tenantId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return reply.send(deliveries);
    },
  );
}
