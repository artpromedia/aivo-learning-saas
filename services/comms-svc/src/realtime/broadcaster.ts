import type { FastifyInstance } from "fastify";

export type RealtimeEvent =
  | "notification:new"
  | "recommendation:new"
  | "brain:updated"
  | "xp:earned"
  | "badge:earned"
  | "level:up"
  | "streak:broken";

export interface BroadcastPayload {
  type: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export function broadcastToUser(app: FastifyInstance, userId: string, event: RealtimeEvent, payload: BroadcastPayload): void {
  app.io.to(`user:${userId}`).emit(event, payload);
  app.log.debug({ userId, event }, "Broadcast sent to user");
}

export function broadcastNotification(
  app: FastifyInstance,
  userId: string,
  notification: { id: string; type: string; title: string; body: string; actionUrl?: string },
): void {
  broadcastToUser(app, userId, "notification:new", {
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: { id: notification.id, actionUrl: notification.actionUrl },
  });
}
