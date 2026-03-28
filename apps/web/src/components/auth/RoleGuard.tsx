"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return null;
  }

  const normalizedRole = user.role?.toUpperCase();
  const hasAccess = allowedRoles.some(
    (role) => role.toUpperCase() === normalizedRole,
  );

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldX className="text-red-400 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You don't have permission to access this page. If you believe this is
          an error, please contact your administrator.
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Required role: {allowedRoles.join(" or ")}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
