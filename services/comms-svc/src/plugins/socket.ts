import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Server as SocketServer } from "socket.io";
import { jwtVerify, importSPKI } from "jose";
import { getConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    io: SocketServer;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();

  const io = new SocketServer(fastify.server, {
    cors: {
      origin: config.APP_URL,
      credentials: true,
    },
    path: "/comms/ws",
    transports: ["websocket", "polling"],
  });

  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const publicKey = await importSPKI(config.JWT_PUBLIC_KEY, "RS256");
      const { payload } = await jwtVerify(token, publicKey);
      (socket.data as Record<string, unknown>).userId = payload.sub;
      (socket.data as Record<string, unknown>).tenantId = payload.tenantId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as Record<string, unknown>).userId as string;
    if (userId) {
      socket.join(`user:${userId}`);
      fastify.log.info({ userId, socketId: socket.id }, "Socket connected");
    }

    socket.on("disconnect", () => {
      fastify.log.info({ userId, socketId: socket.id }, "Socket disconnected");
    });
  });

  fastify.decorate("io", io);

  fastify.addHook("onClose", async () => {
    io.close();
  });
});
