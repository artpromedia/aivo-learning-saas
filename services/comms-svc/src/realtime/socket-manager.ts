import type { Server as SocketServer } from "socket.io";

export function getUserSockets(io: SocketServer, userId: string): string[] {
  const room = io.sockets.adapter.rooms.get(`user:${userId}`);
  return room ? Array.from(room) : [];
}

export function isUserOnline(io: SocketServer, userId: string): boolean {
  const room = io.sockets.adapter.rooms.get(`user:${userId}`);
  return room !== undefined && room.size > 0;
}

export function getOnlineUserCount(io: SocketServer): number {
  let count = 0;
  for (const [room] of io.sockets.adapter.rooms) {
    if (room.startsWith("user:")) {
      count++;
    }
  }
  return count;
}
