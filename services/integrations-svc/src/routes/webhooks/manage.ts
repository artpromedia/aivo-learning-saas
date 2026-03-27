import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { WebhookService } from "../../services/webhook.service.js";

export async function webhookManageRoutes(app: FastifyInstance) {
  const preHandler = [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")];

  app.get(
    "/integrations/webhooks",
    { preHandler },
    async (request, reply) => {
      const { tenantId } = (request as any).user;
      const service = new WebhookService(app);
      const webhooks = await service.list(tenantId);
      return reply.send({ webhooks });
    },
  );

  app.post(
    "/integrations/webhooks",
    { preHandler },
    async (request, reply) => {
      const { tenantId } = (request as any).user;
      const service = new WebhookService(app);
      const webhook = await service.create(tenantId, request.body as any);
      return reply.status(201).send({ webhook });
    },
  );

  app.patch(
    "/integrations/webhooks/:id",
    { preHandler },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { tenantId } = (request as any).user;
      const service = new WebhookService(app);
      const webhook = await service.update(id, tenantId, request.body as any);
      return reply.send({ webhook });
    },
  );

  app.delete(
    "/integrations/webhooks/:id",
    { preHandler },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { tenantId } = (request as any).user;
      const service = new WebhookService(app);
      await service.delete(id, tenantId);
      return reply.send({ success: true });
    },
  );
}
