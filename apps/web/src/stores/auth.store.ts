import { create } from "zustand";

import type { PlatformRole } from "@/lib/rbac";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "parent" | "learner" | "therapist" | "educator" | "admin" | "caregiver" | "platform_admin";
  avatarUrl?: string;
  platformRole?: PlatformRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export function hydrateTestUser(): boolean {
  if (typeof document === "undefined") return false;
  const match = /(?:^|;\s*)user_role=(\w+)/.exec(document.cookie);
  if (!match) return false;
  const role = match[1];
  const names: Record<string, string> = { parent: "Sarah Johnson", learner: "Alex Johnson", teacher: "Ms. Rivera", admin: "Admin User", caregiver: "Jamie Rodriguez", platform_admin: "Platform Admin" };
  const storeRole = role === "teacher" ? "educator" : role;
  const platformRole = role === "platform_admin" ? "super_admin" as const : undefined;
  useAuthStore.getState().login(
    {
      id: `test-${role}-1`,
      email: `${role}@test.aivo.com`,
      name: names[role] || "Test User",
      role: storeRole as User["role"],
      platformRole,
    },
    "test-token",
  );
  return true;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),

  login: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
