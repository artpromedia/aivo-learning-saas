import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export interface XpData {
  totalXp: number;
  weeklyXp: number;
  dailyXp: number;
  xpToNextLevel: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  category: string;
}

export interface LevelData {
  level: number;
  title: string;
  currentXp: number;
  requiredXp: number;
}

export interface EngagementSummary {
  xp: XpData;
  streak: StreakData;
  badges: BadgeData[];
  level: LevelData;
}

export function useEngagement(learnerId: string | undefined) {
  const summaryQuery = useQuery({
    queryKey: ["engagement", learnerId],
    queryFn: () =>
      apiFetch<EngagementSummary>(API_ROUTES.ENGAGEMENT.SUMMARY(learnerId!)),
    enabled: !!learnerId,
  });

  const xpQuery = useQuery({
    queryKey: ["engagement", "xp", learnerId],
    queryFn: () => apiFetch<XpData>(API_ROUTES.ENGAGEMENT.XP(learnerId!)),
    enabled: !!learnerId,
  });

  const streakQuery = useQuery({
    queryKey: ["engagement", "streak", learnerId],
    queryFn: () =>
      apiFetch<StreakData>(API_ROUTES.ENGAGEMENT.STREAKS(learnerId!)),
    enabled: !!learnerId,
  });

  const badgesQuery = useQuery({
    queryKey: ["engagement", "badges", learnerId],
    queryFn: () =>
      apiFetch<BadgeData[]>(API_ROUTES.ENGAGEMENT.BADGES(learnerId!)),
    enabled: !!learnerId,
  });

  const levelQuery = useQuery({
    queryKey: ["engagement", "level", learnerId],
    queryFn: () =>
      apiFetch<LevelData>(API_ROUTES.ENGAGEMENT.LEVEL(learnerId!)),
    enabled: !!learnerId,
  });

  return {
    summary: summaryQuery.data,
    xp: xpQuery.data,
    streak: streakQuery.data,
    badges: badgesQuery.data ?? [],
    level: levelQuery.data,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
  };
}
