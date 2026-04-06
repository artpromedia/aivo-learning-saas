"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { AUTH_ROUTES } from "@/lib/api-routes";

interface SessionResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  token?: string;
}

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/accept-invite"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setToken, setLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const data = await apiFetch<SessionResponse>(AUTH_ROUTES.SESSION);
        if (!cancelled) {
          setUser({ ...data.user, role: data.user.role.toLowerCase() as "parent" | "therapist" | "educator" | "admin" });
          setToken(data.token ?? "");
        }
      } catch {
        if (!cancelled) {
          logout();
          // Clear stale role cookie so middleware redirects properly
          document.cookie = "user_role=; path=/; max-age=0";
          // Redirect to login if on a protected page
          const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/";
          if (!isPublic) {
            router.replace("/login");
            return;
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [setUser, setToken, setLoading, logout, router, pathname]);

  return <>{children}</>;
}
