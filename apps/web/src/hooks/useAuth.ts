import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
    tenantId?: string;
  };
  token?: string;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<LoginResponse>(API_ROUTES.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      storeLogin(
        { ...data.user, role: data.user.role.toLowerCase() as "parent" | "therapist" | "educator" | "admin" },
        data.token ?? "",
      );
      return data;
    },
    [storeLogin],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch(API_ROUTES.AUTH.LOGOUT, { method: "POST" });
    } catch {
      // Always clear local state even if server call fails
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
