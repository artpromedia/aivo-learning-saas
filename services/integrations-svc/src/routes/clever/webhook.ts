import type { FastifyInstance } from "fastify";
import { CleverService } from "../../services/clever.service.js";

export async function cleverWebhookRoute(app: FastifyInstance) {
  app.post(
    "/integrations/clever/webhook",
    async (request, reply) => {
      const service = new CleverService(app);
      await service.handleWebhook(request.body as { type: string; data: Record<string, unknown> });
      return reply.status(200).send({ ok: true });
    },
  );
}
