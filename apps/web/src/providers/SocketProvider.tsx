"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth.store";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleConnect = useCallback(() => setIsConnected(true), []);
  const handleDisconnect = useCallback(() => setIsConnected(false), []);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const s = connectSocket(token ?? undefined);
    setSocket(s);

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      disconnectSocket();
    };
  }, [isAuthenticated, token, handleConnect, handleDisconnect]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
