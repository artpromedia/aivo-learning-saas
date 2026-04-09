"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Bot,
  Compass,
  Flame,
  Trophy,
  Loader2,
  ChevronRight,
  Clock,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";
import { useEngagement } from "@/hooks/useEngagement";

interface LearningActivity {
  id: string;
  title: string;
  subject: string;
  type: "lesson" | "quest" | "practice" | "homework";
  estimatedMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  thumbnailUrl?: string;
  progress: number;
}

const quickActionCards = [
  { href: "/learner/quests", icon: Compass, label: "quests", color: "#2DD4BF", bgColor: "#CCFBF1", labelKey: "questsLabel" },
  { href: "/learner/tutors", icon: Bot, label: "tutors", color: "#38BDF8", bgColor: "#E0F2FE", labelKey: "tutors" },
  { href: "/learner/homework", icon: BookOpen, label: "homework", color: "#FB923C", bgColor: "#FFF7ED", labelKey: "homework" },
];

export default function LearnerHomePage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const { xp, streak, level, isLoading: engLoading } = useEngagement(activeLearner?.id);

  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchActivities() {
      try {
        const data = await apiFetch<LearningActivity[]>(
          API_ROUTES.SESSION.LEARNING_PATH_NEXT(activeLearner!.id),
        );
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadActivities"));
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [activeLearner]);

  const typeIcons: Record<string, React.ReactNode> = {
    lesson: <BookOpen size={20} />,
    quest: <Compass size={20} />,
    practice: <Sparkles size={20} />,
    homework: <BookOpen size={20} />,
  };

  const typeColors: Record<string, { color: string; bg: string }> = {
    lesson: { color: "#7C3AED", bg: "#F0E6FF" },
    quest: { color: "#2DD4BF", bg: "#CCFBF1" },
    practice: { color: "#F472B6", bg: "#FCE7F3" },
    homework: { color: "#FB923C", bg: "#FFF7ED" },
  };

  const difficultyVariants: Record<string, "success" | "warning" | "error"> = {
    easy: "success",
    medium: "warning",
    hard: "error",
  };

  return (
    <div>
      <PurpleGradientHeader className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {t("heyName", { name: activeLearner?.name ?? "Learner" })}
            </h1>
            <p className="mt-1 text-white/80 font-medium">
              {t("readyToLearn")}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <Trophy size={18} />
                <span className="font-extrabold text-lg">{xp?.totalXp ?? 0}</span>
              </div>
              <span className="text-xs text-white/70 font-semibold">{t("xp")}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <Flame size={18} />
                <span className="font-extrabold text-lg">{streak?.currentStreak ?? 0}</span>
              </div>
              <span className="text-xs text-white/70 font-semibold">{t("streak")}</span>
            </div>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {quickActionCards.map(({ href, icon: Icon, labelKey, color, bgColor }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer h-full hover:scale-[1.03]">
              <CardBody className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: bgColor, color }}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>
                  {t(labelKey)}
                </span>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-extrabold mb-4" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
        {t("todaysLearningPath")}
      </h2>

      {error && (
        <div className="mb-4 p-4 rounded-2xl text-sm font-medium" style={{ backgroundColor: "#FFE0E0", color: "#991B1B", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} className="w-full" rounded="lg" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ backgroundColor: "var(--aivo-purple-50)", color: "var(--aivo-purple-500)" }}>
              <Star size={32} />
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
              {t("allCaughtUp")}
            </h3>
            <p className="font-medium mb-4" style={{ color: "var(--aivo-text-secondary)" }}>
              {t("noActivitiesScheduled")}
            </p>
            <Link href="/learner/quests">
              <Button>{t("exploreQuests")}</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const tc = typeColors[activity.type] || typeColors.lesson;
            return (
              <Link
                key={activity.id}
                href={activity.type === "quest" ? "/learner/quests" : `/learner/learn/${activity.id}`}
              >
                <Card className="hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer group hover:scale-[1.01]">
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: tc.bg, color: tc.color }}>
                        {typeIcons[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>
                            {activity.title}
                          </h3>
                          <Badge variant="secondary">{activity.subject}</Badge>
                          <Badge variant={difficultyVariants[activity.difficulty]}>
                            {activity.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold mb-2" style={{ color: "var(--aivo-text-muted)" }}>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {activity.estimatedMinutes} min
                          </span>
                          <span className="capitalize">{activity.type}</span>
                        </div>
                        {activity.progress > 0 && (
                          <ProgressBar value={activity.progress} showLabel={false} size="sm" />
                        )}
                      </div>
                      <ChevronRight className="shrink-0 mt-2 transition-all group-hover:translate-x-1" size={20} style={{ color: "var(--aivo-text-muted)" }} />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
