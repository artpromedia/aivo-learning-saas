import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "parent" | "learner" | "therapist" | "educator" | "admin";
  avatarUrl?: string;
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

function getTestUserFromCookie(): User | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)user_role=(\w+)/);
  if (!match) return null;
  const role = match[1];
  const names: Record<string, string> = { parent: "Sarah Johnson", learner: "Alex Johnson", teacher: "Ms. Rivera", admin: "Admin User" };
  const storeRole = role === "teacher" ? "educator" : role;
  return {
    id: `test-${role}-1`,
    email: `${role}@test.aivo.com`,
    name: names[role] || "Test User",
    role: storeRole as User["role"],
  };
}

export const useAuthStore = create<AuthState>((set) => {
  const testUser = getTestUserFromCookie();
  return {
    user: testUser,
    token: testUser ? "test-token" : null,
    isAuthenticated: !!testUser,
    isLoading: !testUser,

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
  };
});
