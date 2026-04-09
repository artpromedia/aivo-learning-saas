"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, BookOpen, Bot, Compass, Flame, Trophy,
  ChevronRight, Clock, Star, Swords, ShoppingBag, Medal,
  Zap, Target, Gift, TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
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
  { href: "/learner/quests", icon: Compass, label: "Quests", emoji: "🗺️", gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)", labelKey: "questsLabel" },
  { href: "/learner/tutors", icon: Bot, label: "Tutors", emoji: "🤖", gradient: "linear-gradient(135deg, #38BDF8, #0EA5E9)", labelKey: "tutors" },
  { href: "/learner/homework", icon: BookOpen, label: "Homework", emoji: "📚", gradient: "linear-gradient(135deg, #FB923C, #F97316)", labelKey: "homework" },
  { href: "/learner/challenges", icon: Swords, label: "Challenges", emoji: "⚔️", gradient: "linear-gradient(135deg, #F472B6, #EC4899)", labelKey: "challenges" },
  { href: "/learner/shop", icon: ShoppingBag, label: "Shop", emoji: "🛍️", gradient: "linear-gradient(135deg, #A855F7, #7C3AED)", labelKey: "avatarShop" },
  { href: "/learner/badges", icon: Medal, label: "Badges", emoji: "🏅", gradient: "linear-gradient(135deg, #FBBF24, #F59E0B)", labelKey: "badgeCollection" },
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

  const typeColors: Record<string, { gradient: string }> = {
    lesson: { gradient: "linear-gradient(135deg, #7C3AED, #A855F7)" },
    quest: { gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)" },
    practice: { gradient: "linear-gradient(135deg, #F472B6, #EC4899)" },
    homework: { gradient: "linear-gradient(135deg, #FB923C, #F97316)" },
  };

  const difficultyVariants: Record<string, "success" | "warning" | "error"> = {
    easy: "success",
    medium: "warning",
    hard: "error",
  };

  const levelProgress = level ? Math.round((level.currentXp / level.requiredXp) * 100) : 0;

  return (
    <PageWrapper>
      <PurpleGradientHeader className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold border-2 border-white/30"
              style={{ animation: "aivo-pop-in 0.5s ease-out" }}
            >
              {activeLearner?.avatarUrl ? (
                <img src={activeLearner.avatarUrl} alt={activeLearner.name} className="w-full h-full rounded-2xl object-cover" />
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
        </div>
      </PurpleGradientHeader>

      <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: "aivo-slide-up 0.4s ease-out" }}>
        <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7C3AED, #6366F1)" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 30%, white, transparent)" }} />
          <div className="relative">
            <div className="text-3xl mb-1" style={{ animation: "aivo-float 3s ease-in-out infinite" }}>⭐</div>
            <div className="text-white font-extrabold text-xl">{xp?.totalXp ?? 0}</div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-wider">{t("xp")}</div>
          </div>
        </div>

        <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F97316, #EF4444)" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 30%, white, transparent)" }} />
          <div className="relative">
            <div className="text-3xl mb-1" style={{ animation: "aivo-float 3s ease-in-out infinite 0.5s" }}>🔥</div>
            <div className="text-white font-extrabold text-xl">{streak?.currentStreak ?? 0}</div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-wider">{t("streak")}</div>
          </div>
        </div>

        <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 30%, white, transparent)" }} />
          <div className="relative">
            <div className="text-3xl mb-1" style={{ animation: "aivo-float 3s ease-in-out infinite 1s" }}>🪙</div>
            <div className="text-white font-extrabold text-xl">680</div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-wider">Coins</div>
          </div>
        </div>
      </div>

      {level && (
        <AnimatedCard delay={200}>
          <div className="rounded-2xl p-4 mb-6 border" style={{ backgroundColor: "var(--aivo-bg-card)", borderColor: "var(--aivo-border)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                  {level.level}
                </div>
                <div>
                  <span className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>{level.title}</span>
                  <span className="text-xs ml-2" style={{ color: "var(--aivo-text-muted)" }}>Level {level.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "#7C3AED" }}>
                <TrendingUp size={14} />
                {level.currentXp}/{level.requiredXp} XP
              </div>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{
                  width: `${levelProgress}%`,
                  background: "linear-gradient(90deg, #7C3AED, #A855F7, #C084FC)",
                }}
              >
                <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation: "aivo-shimmer 2s ease-in-out infinite" }} />
              </div>
            </div>
            <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--aivo-text-muted)" }}>
              {(level.requiredXp - level.currentXp)} XP to Level {level.level + 1}
            </p>
          </div>
        </AnimatedCard>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {quickActionCards.map(({ href, icon: Icon, label, emoji, gradient, labelKey }, idx) => (
          <AnimatedCard key={href} delay={300 + idx * 60}>
            <Link href={href}>
              <div className="rounded-2xl p-3 text-center transition-all cursor-pointer hover:scale-[1.08] active:scale-[0.95] group relative overflow-hidden"
                style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" style={{ background: gradient }} />
                <div className="w-11 h-11 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-lg relative" style={{ background: gradient }}>
                  <span className="drop-shadow-sm">{emoji}</span>
                </div>
                <span className="text-xs font-bold block" style={{ color: "var(--aivo-text)" }}>
                  {t(labelKey)}
                </span>
              </div>
            </Link>
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard delay={400}>
        <Link href="/learner/challenges">
          <div
            className="rounded-2xl p-4 mb-6 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all group relative overflow-hidden border"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))",
              borderColor: "rgba(124,58,237,0.2)",
            }}
          >
            <div className="absolute right-0 top-0 w-32 h-32 opacity-5" style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }} />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl" style={{ background: "linear-gradient(135deg, #F472B6, #EC4899)" }}>
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-sm" style={{ color: "var(--aivo-text)" }}>
                Daily Challenge Available!
              </h3>
              <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
                Speed Math Challenge — Win 100 XP bonus!
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white shrink-0" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
              <Zap size={12} />
              Go!
            </div>
          </div>
        </Link>
      </AnimatedCard>

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
                    <div className="flex items-start gap-4 p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.01] group relative overflow-hidden"
                      style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg" style={{ background: tc.gradient }}>
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
                          <span className="capitalize flex items-center gap-1">
                            <Target size={11} />
                            {activity.type}
                          </span>
                          <span className="flex items-center gap-1 font-bold" style={{ color: "#7C3AED" }}>
                            <Star size={11} />
                            +{activity.estimatedMinutes * 3} XP
                          </span>
                        </div>
                        {activity.progress > 0 && (
                          <ProgressBar value={activity.progress} showLabel={false} size="sm" />
                        )}
                      </div>
                      <div className="shrink-0 mt-2 w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                        <ChevronRight size={16} style={{ color: "#7C3AED" }} />
                      </div>
                    </div>
                  </Link>
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </ExpandableCard>

      <AnimatedCard delay={700}>
        <div className="mt-6 rounded-2xl p-5 border relative overflow-hidden" style={{ backgroundColor: "var(--aivo-bg-card)", borderColor: "var(--aivo-border)" }}>
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10 rounded-full" style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }} />
          <h3 className="font-extrabold text-base mb-3 flex items-center gap-2" style={{ color: "var(--aivo-text)" }}>
            <Gift size={18} style={{ color: "#FBBF24" }} />
            Recent Achievements
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              { emoji: "🔥", name: "Week Warrior", desc: "7-day streak!" },
              { emoji: "🧮", name: "Math Whiz", desc: "5 perfect scores" },
              { emoji: "🦋", name: "Social Butterfly", desc: "3 tutors used" },
            ].map((badge, idx) => (
              <div key={idx} className="flex-shrink-0 w-24 text-center p-3 rounded-xl border" style={{ borderColor: "var(--aivo-border)", animation: `aivo-pop-in 0.5s ease-out ${0.8 + idx * 0.15}s both` }}>
                <div className="text-2xl mb-1">{badge.emoji}</div>
                <div className="text-xs font-bold" style={{ color: "var(--aivo-text)" }}>{badge.name}</div>
                <div className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{badge.desc}</div>
              </div>
            ))}
            <Link href="/learner/badges" className="flex-shrink-0 w-24 text-center p-3 rounded-xl border flex flex-col items-center justify-center group hover:scale-[1.05] transition-all" style={{ borderColor: "var(--aivo-border)", borderStyle: "dashed" }}>
              <ChevronRight size={20} style={{ color: "var(--aivo-text-muted)" }} />
              <div className="text-xs font-bold mt-1" style={{ color: "var(--aivo-text-muted)" }}>See All</div>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    </PageWrapper>
  );
}
