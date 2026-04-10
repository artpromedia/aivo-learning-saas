import { io, Socket } from "socket.io-client";

const SOCKET_URL = globalThis.window === undefined ? "" : globalThis.window.location.origin;

let socket: Socket | null = null;

export function getSocket(): Socket {
  socket ??= io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    path: "/comms/ws",
  });
  return socket;
}

export function connectSocket(token?: string): Socket {
  const s = getSocket();
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
