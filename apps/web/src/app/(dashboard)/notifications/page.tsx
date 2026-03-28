"use client";

import React from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useNotifications } from "@/hooks/useNotifications";

const typeConfig: Record<
  string,
  { icon: React.ReactNode; variant: "default" | "success" | "warning" | "error" }
> = {
  info: {
    icon: <Info size={18} className="text-blue-500" />,
    variant: "default",
  },
  success: {
    icon: <CheckCircle size={18} className="text-green-500" />,
    variant: "success",
  },
  warning: {
    icon: <AlertTriangle size={18} className="text-yellow-500" />,
    variant: "warning",
  },
  error: {
    icon: <XCircle size={18} className="text-red-500" />,
    variant: "error",
  },
};

export default function NotificationsPage() {
  const t = useTranslations("dashboard");
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={80} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={32} />
            <div>
              <h1 className="text-2xl font-bold">{t("notifications")}</h1>
              <p className="text-white/80 text-sm">
                {unreadCount > 0
                  ? t("unreadNotifications", { count: unreadCount })
                  : t("allCaughtUp")}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={markAllAsRead}
              leftIcon={<CheckCheck size={16} />}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              {t("markAllRead")}
            </Button>
          )}
        </div>
      </PurpleGradientHeader>

      {notifications.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Bell className="mx-auto mb-3 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("noNotifications")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("noNotificationsDescription")}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] ?? typeConfig.info;
            return (
              <Card
                key={notification.id}
                className={`transition-all ${
                  !notification.read
                    ? "border-l-4 border-l-[#7C3AED] bg-[#7C3AED]/[0.02]"
                    : "opacity-75"
                }`}
              >
                <CardBody className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3
                        className={`text-sm font-medium ${
                          !notification.read
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
