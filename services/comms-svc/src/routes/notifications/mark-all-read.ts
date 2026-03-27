import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { NotificationService } from "../../services/notification.service.js";

export async function markAllReadRoute(app: FastifyInstance): Promise<void> {
  app.patch("/comms/notifications/read-all", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const service = new NotificationService(app);
    await service.markAllAsRead(request.user.sub);
    return reply.send({ success: true });
  });
}
