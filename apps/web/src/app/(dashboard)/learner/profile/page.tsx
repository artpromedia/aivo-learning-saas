"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera, Edit3, Flame, Loader2, Medal, RefreshCw, Star, Trophy, Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";
import { useEngagement } from "@/hooks/useEngagement";

interface ProfileStats {
  totalSessions: number;
  questsCompleted: number;
  challengesWon: number;
  homeworkHelped: number;
  joinedAt: string;
}

export default function LearnerProfilePage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const updateLearner = useLearnerStore((s) => s.updateLearner);
  const { xp, streak, badges, level, isLoading: engLoading } = useEngagement(activeLearner?.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;
    async function fetchStats() {
      try {
        const data = await apiFetch<ProfileStats>(`/api/learners/${activeLearner!.id}/profile/stats`);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadStats"));
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [activeLearner]);

  const handleAvatarUpload = async (file: File) => {
    if (!activeLearner?.id) return;
    setUploading(true);
    setError(null);
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("Image must be smaller than 5MB");
      }
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      const isMock = document.cookie.includes("user_role=");
      if (isMock) {
        const oldUrl = activeLearner.avatarUrl;
        if (oldUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(oldUrl);
        }

        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read image"));
          reader.readAsDataURL(file);
        });
        updateLearner(activeLearner.id, { avatarUrl: dataUrl });
      } else {
        const formData = new FormData();
        formData.append("avatar", file);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/learners/${activeLearner.id}/avatar`,
          { method: "PUT", credentials: "include", body: formData }
        );
        if (!res.ok) throw new Error("Avatar upload failed");
        const { avatarUrl } = await res.json();
        updateLearner(activeLearner.id, { avatarUrl });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  if (!activeLearner) {
    return (
      <div className="text-center py-16">
        <p style={{ color: "var(--aivo-text-secondary)" }}>{t("noLearnerSelected")}</p>
        <Button variant="outline" onClick={() => router.push("/learner")} className="mt-4">{t("goHome")}</Button>
      </div>
    );
  }

  if (engLoading || loadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton height={200} className="w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>Retry</Button>
      </div>
    );
  }

  const memberSince = stats?.joinedAt
    ? new Date(stats.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Unknown";

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome")}</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden shrink-0">
              {activeLearner.avatarUrl ? (
                <img src={activeLearner.avatarUrl} alt={activeLearner.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{activeLearner.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? <Loader2 className="text-white animate-spin" size={20} /> : <Camera className="text-white" size={20} />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">{activeLearner.name}</h1>
            <p className="text-white/70 text-sm mt-0.5">{t("memberSince", { date: memberSince })}</p>
            {level && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white border-none">Level {level.level}</Badge>
                  <span className="text-xs text-white/70">{level.title}</span>
                </div>
                <div className="w-full max-w-xs h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-700"
                    style={{ width: `${level.requiredXp > 0 ? (level.currentXp / level.requiredXp) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-white/60 mt-1">{level.currentXp} / {level.requiredXp} XP to next level</p>
              </div>
            )}
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon={<Star size={18} />} label={t("level")} value={level?.level ?? 1} color="#7C3AED" delay={100} />
        <StatCard icon={<Zap size={18} />} label={t("totalXp")} value={xp?.totalXp ?? 0} color="#A855F7" delay={200} />
        <StatCard icon={<Flame size={18} />} label={t("dayStreak")} value={streak?.currentStreak ?? 0} color="#FB923C" delay={300} />
        <StatCard icon={<Medal size={18} />} label={t("badgeCollection")} value={badges.length} color="#FBBF24" delay={400} />
      </div>

      <ExpandableCard
        icon={<Zap size={16} />}
        title={t("activity")}
        subtitle="Your detailed learning activity breakdown"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={500}
        infoText="This shows a detailed breakdown of your learning activity including total sessions, quests completed, challenges won, and more."
      >
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("totalSessions")}</span>
            <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{stats?.totalSessions ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("questsCompleted")}</span>
            <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{stats?.questsCompleted ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("challengesWon")}</span>
            <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{stats?.challengesWon ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("homeworkHelped")}</span>
            <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{stats?.homeworkHelped ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("weeklyXp")}</span>
            <span className="text-sm font-bold" style={{ color: "#7C3AED" }}>{xp?.weeklyXp ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("longestStreak")}</span>
            <span className="text-sm font-bold" style={{ color: "#FB923C" }}>{streak?.longestStreak ?? 0} {t("days")}</span>
          </div>
        </div>
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard
          icon={<Trophy size={16} />}
          title={t("recentBadges")}
          subtitle="Your latest achievements"
          gradient="linear-gradient(135deg, #FBBF24, #F59E0B)"
          delay={600}
          linkHref="/learner/badges"
          linkLabel={badges.length > 0 ? t("viewAll") : undefined}
        >
          {badges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto mb-3" size={40} style={{ color: "var(--aivo-text-muted)" }} />
              <h3 className="text-base font-bold mb-1" style={{ color: "var(--aivo-text)" }}>{t("noBadgesYet")}</h3>
              <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("earnFirstBadge")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {badges.slice(0, 6).map((badge, idx) => (
                <AnimatedCard key={badge.id} delay={700 + idx * 60}>
                  <Card className="hover:shadow-[var(--shadow-card)] transition-all hover:scale-[1.05]">
                    <CardBody className="flex flex-col items-center text-center py-3 px-2">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center mb-1.5 overflow-hidden text-white"
                        style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                        {badge.iconUrl ? (
                          <img src={badge.iconUrl} alt={badge.name} className="w-7 h-7 object-contain" />
                        ) : (
                          <Trophy size={18} />
                        )}
                      </div>
                      <p className="text-xs font-bold truncate w-full" style={{ color: "var(--aivo-text)" }}>{badge.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </CardBody>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          )}
        </ExpandableCard>
      </div>

      <div className="mt-6 flex justify-center">
        <AnimatedCard delay={800}>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} leftIcon={<Edit3 size={16} />} loading={uploading}>
            {t("changeAvatar")}
          </Button>
        </AnimatedCard>
      </div>
    </PageWrapper>
  );
}
