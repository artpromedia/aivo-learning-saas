import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import {
  useNotificationStore,
  type Notification,
} from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { notifications, unreadCount, setNotifications, addNotification, markAsRead: storeMarkAsRead, markAllAsRead: storeMarkAllAsRead } =
    useNotificationStore();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Fetch initial notifications
  const listQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Notification[]>(API_ROUTES.NOTIFICATION.LIST),
    enabled: isAuthenticated,
  });

  // Sync query data to store
  useEffect(() => {
    if (listQuery.data) {
      setNotifications(listQuery.data);
    }
  }, [listQuery.data, setNotifications]);

  // Socket.IO real-time listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket(token ?? undefined);

    socket.on("notification", (data: Notification) => {
      addNotification(data);
    });

    return () => {
      socket.off("notification");
      disconnectSocket();
    };
  }, [isAuthenticated, token, addNotification]);

  const markAsRead = useCallback(
    async (id: string) => {
      storeMarkAsRead(id);
      try {
        await apiFetch(API_ROUTES.NOTIFICATION.MARK_READ(id), {
          method: "POST",
        });
      } catch {
        // Revert optimistic update
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    },
    [storeMarkAsRead, queryClient],
  );

  const markAllAsRead = useCallback(async () => {
    storeMarkAllAsRead();
    try {
      await apiFetch(API_ROUTES.NOTIFICATION.MARK_ALL_READ, {
        method: "POST",
      });
    } catch {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }, [storeMarkAllAsRead, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    markAsRead,
    markAllAsRead,
  };
}
