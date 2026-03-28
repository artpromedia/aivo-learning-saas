"use client";

import { useEffect } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setToken, setLoading, logout } = useAuthStore();

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
  }, [setUser, setToken, setLoading, logout]);

  return <>{children}</>;
}
