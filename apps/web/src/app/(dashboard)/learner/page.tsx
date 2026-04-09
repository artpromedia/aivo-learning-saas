"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, BookOpen, Bot, Compass, Flame, Trophy,
  ChevronRight, Clock, Star, Swords, ShoppingBag, Medal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, ExpandableCard, StatCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
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
  { href: "/learner/quests", icon: Compass, label: "Quests", color: "#2DD4BF", gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)", labelKey: "questsLabel" },
  { href: "/learner/tutors", icon: Bot, label: "Tutors", color: "#38BDF8", gradient: "linear-gradient(135deg, #38BDF8, #0EA5E9)", labelKey: "tutors" },
  { href: "/learner/homework", icon: BookOpen, label: "Homework", color: "#FB923C", gradient: "linear-gradient(135deg, #FB923C, #F97316)", labelKey: "homework" },
  { href: "/learner/challenges", icon: Swords, label: "Challenges", color: "#F472B6", gradient: "linear-gradient(135deg, #F472B6, #EC4899)", labelKey: "challenges" },
  { href: "/learner/shop", icon: ShoppingBag, label: "Shop", color: "#A855F7", gradient: "linear-gradient(135deg, #A855F7, #7C3AED)", labelKey: "avatarShop" },
  { href: "/learner/badges", icon: Medal, label: "Badges", color: "#FBBF24", gradient: "linear-gradient(135deg, #FBBF24, #F59E0B)", labelKey: "badgeCollection" },
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

  const typeColors: Record<string, { color: string; gradient: string }> = {
    lesson: { color: "#7C3AED", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)" },
    quest: { color: "#2DD4BF", gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)" },
    practice: { color: "#F472B6", gradient: "linear-gradient(135deg, #F472B6, #EC4899)" },
    homework: { color: "#FB923C", gradient: "linear-gradient(135deg, #FB923C, #F97316)" },
  };

  const difficultyVariants: Record<string, "success" | "warning" | "error"> = {
    easy: "success",
    medium: "warning",
    hard: "error",
  };

  return (
    <PageWrapper>
      <PurpleGradientHeader className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-extrabold">
              {activeLearner?.avatarUrl ? (
                <img src={activeLearner.avatarUrl} alt={activeLearner.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                activeLearner?.name?.charAt(0).toUpperCase() ?? "?"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                {t("heyName", { name: activeLearner?.name ?? "Learner" })}
              </h1>
              <p className="mt-0.5 text-white/80 font-medium text-sm">
                {t("readyToLearn")}
              </p>
            </div>
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

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {quickActionCards.map(({ href, icon: Icon, label, color, gradient, labelKey }, idx) => (
          <AnimatedCard key={href} delay={100 + idx * 60}>
            <Link href={href}>
              <div className="rounded-2xl p-3 text-center transition-all cursor-pointer hover:scale-[1.05] active:scale-[0.97]"
                style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-white" style={{ background: gradient }}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-bold block" style={{ color: "var(--aivo-text)" }}>
                  {t(labelKey)}
                </span>
              </div>
            </Link>
          </AnimatedCard>
        ))}
      </div>

      <ExpandableCard
        icon={<Sparkles size={16} />}
        title={t("todaysLearningPath")}
        subtitle="Your personalized activities for today"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={500}
        infoText="AIVO picks the best activities for you based on what you've been learning. Complete them to earn XP and keep your streak going!"
      >
        {error && (
          <div className="mb-4 p-4 rounded-2xl text-sm font-medium" style={{ backgroundColor: "#FFE0E0", color: "#991B1B", border: "1px solid #FECACA" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={90} className="w-full" rounded="lg" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{
              backgroundColor: "var(--aivo-purple-50)", color: "var(--aivo-purple-500)",
              animation: "aivo-float 3s ease-in-out infinite",
            }}>
              <Star size={28} />
            </div>
            <h3 className="text-base font-extrabold mb-1" style={{ color: "var(--aivo-text)" }}>
              {t("allCaughtUp")}
            </h3>
            <p className="text-sm mb-3" style={{ color: "var(--aivo-text-secondary)" }}>
              {t("noActivitiesScheduled")}
            </p>
            <Link href="/learner/quests">
              <Button size="sm">{t("exploreQuests")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, idx) => {
              const tc = typeColors[activity.type] || typeColors.lesson;
              return (
                <AnimatedCard key={activity.id} delay={600 + idx * 80}>
                  <Link href={activity.type === "quest" ? "/learner/quests" : `/learner/learn/${activity.id}`}>
                    <div className="flex items-start gap-4 p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.01] group"
                      style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: tc.gradient }}>
                        {typeIcons[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>
                            {activity.title}
                          </h3>
                          <Badge variant="secondary">{activity.subject}</Badge>
                          <Badge variant={difficultyVariants[activity.difficulty]}>
                            {activity.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold mb-1.5" style={{ color: "var(--aivo-text-muted)" }}>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {activity.estimatedMinutes} min
                          </span>
                          <span className="capitalize">{activity.type}</span>
                        </div>
                        {activity.progress > 0 && (
                          <ProgressBar value={activity.progress} showLabel={false} size="sm" />
                        )}
                      </div>
                      <ChevronRight className="shrink-0 mt-2 transition-all group-hover:translate-x-1" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                    </div>
                  </Link>
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </ExpandableCard>
    </PageWrapper>
  );
}
