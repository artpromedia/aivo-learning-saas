import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { NotificationService } from "../../services/notification.service.js";

export async function inboxRoute(app: FastifyInstance): Promise<void> {
  app.get<{
    Params: { userId: string };
    Querystring: { page?: string; limit?: string };
  }>("/comms/notifications/:userId", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { userId } = request.params;

    // Users can only view their own notifications (or admin can view any)
    if (request.user.sub !== userId && request.user.role !== "PLATFORM_ADMIN") {
      return reply.status(403).send({ error: "Cannot view other user's notifications" });
    }

    const page = Math.max(1, parseInt(request.query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit ?? "20", 10)));

    const service = new NotificationService(app);
    const result = await service.listForUser(userId, page, limit);

    reply.header("X-Unread-Count", result.unreadCount.toString());
    return reply.send({
      items: result.items,
      total: result.total,
      unreadCount: result.unreadCount,
      page,
      limit,
    });
  });
}
