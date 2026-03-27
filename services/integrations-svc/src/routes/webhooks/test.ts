import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { WebhookService } from "../../services/webhook.service.js";

export async function webhookTestRoute(app: FastifyInstance) {
  app.post(
    "/integrations/webhooks/:id/test",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { tenantId } = (request as any).user;

      const service = new WebhookService(app);
      const result = await service.sendTestPayload(id, tenantId);

      return reply.send(result);
    },
  );
}
