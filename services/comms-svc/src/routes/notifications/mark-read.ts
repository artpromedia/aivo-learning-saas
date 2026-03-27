import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { NotificationService } from "../../services/notification.service.js";

export async function markReadRoute(app: FastifyInstance): Promise<void> {
  app.patch<{
    Params: { id: string };
  }>("/comms/notifications/:id/read", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params;
    const service = new NotificationService(app);
    await service.markAsRead(id, request.user.sub);
    return reply.send({ success: true });
  });
}
