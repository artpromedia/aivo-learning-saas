import type { FastifyInstance } from "fastify";
import { getOnlineUserCount } from "../../realtime/socket-manager.js";

export async function websocketRoute(app: FastifyInstance): Promise<void> {
  // Status endpoint for WebSocket health
  app.get("/comms/ws/status", async (_request, reply) => {
    const onlineUsers = getOnlineUserCount(app.io);
    return reply.send({
      status: "ok",
      connectedUsers: onlineUsers,
      transport: "socket.io",
    });
  });
}
