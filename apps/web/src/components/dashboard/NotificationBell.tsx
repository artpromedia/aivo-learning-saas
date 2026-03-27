"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { io, Socket } from "socket.io-client";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: "info" | "success" | "warning" | "error";
}

export interface NotificationBellProps {
  initialNotifications?: Notification[];
  socketUrl?: string;
  className?: string;
}

function NotificationBell({
  initialNotifications = [],
  socketUrl,
  className = "",
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!socketUrl) return;

    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const typeColors: Record<string, string> = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#7C3AED] hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    !notification.read ? "bg-[#7C3AED]/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        !notification.read
                          ? typeColors[notification.type || "info"] || "bg-blue-500"
                          : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { NotificationBell };
