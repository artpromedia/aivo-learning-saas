"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, hydrateTestUser } from "@/stores/auth.store";
import { useLearnerStore } from "@/stores/learner.store";
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

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { setUser, setToken, setLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    if (hydrateTestUser()) {
      const { learners, setLearners, setActiveLearner } = useLearnerStore.getState();
      if (learners.length === 0) {
        const mockLearners = [
          {
            id: "learner-001",
            name: "Alex Johnson",
            avatarUrl: "",
            dateOfBirth: "2017-03-15",
            gradeLevel: "3rd",
            enrolledSubjects: ["Math", "Science", "Language Arts"],
            languagePreference: "en",
            functioningLevel: "SUPPORTED" as const,
            preferences: { theme: "light", reduceAnimations: false, fontSize: "medium" as const, soundEnabled: true },
          },
          {
            id: "learner-002",
            name: "Maya Johnson",
            avatarUrl: "",
            dateOfBirth: "2019-07-22",
            gradeLevel: "1st",
            enrolledSubjects: ["Math", "Language Arts"],
            languagePreference: "en",
            functioningLevel: "STANDARD" as const,
            preferences: { theme: "light", reduceAnimations: false, fontSize: "medium" as const, soundEnabled: true },
          },
        ];
        setLearners(mockLearners);
        setActiveLearner(mockLearners[0]);
      }
      return;
    }

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
          document.cookie = "user_role=; path=/; max-age=0";
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
