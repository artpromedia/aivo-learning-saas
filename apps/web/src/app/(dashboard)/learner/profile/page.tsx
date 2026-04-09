"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Edit3,
  Flame,
  Loader2,
  Medal,
  RefreshCw,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
  const { xp, streak, badges, level, isLoading: engLoading } = useEngagement(
    activeLearner?.id,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchStats() {
      try {
        const data = await apiFetch<ProfileStats>(
          `/api/learners/${activeLearner!.id}/profile/stats`,
        );
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("failedToLoadStats"),
        );
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
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/learners/${activeLearner.id}/avatar`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Avatar upload failed");
      const { avatarUrl } = await res.json();
      updateLearner(activeLearner.id, { avatarUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  if (!activeLearner) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--aivo-text-secondary)] mb-4">{t("noLearnerSelected")}</p>
        <Button variant="outline" onClick={() => router.push("/learner")}>
          {t("goHome")}
        </Button>
      </div>
    );
  }

  if (engLoading || loadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton height={200} className="w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton height={120} className="w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          Retry
        </Button>
      </div>
    );
  }

  const memberSince = stats?.joinedAt
    ? new Date(stats.joinedAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div>
      <Link
        href="/learner"
        className="inline-flex items-center gap-1 text-sm text-[var(--aivo-text-secondary)] hover:text-[var(--aivo-text)] dark:text-[var(--aivo-text-muted)] dark:hover:text-[#A89BB5] mb-4"
      >
        <ArrowLeft size={16} />
        {t("backToHome")}
      </Link>

      {/* Profile Header */}
      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden shrink-0">
              {activeLearner.avatarUrl ? (
                <img
                  src={activeLearner.avatarUrl}
                  alt={activeLearner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {activeLearner.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="text-white animate-spin" size={20} />
              ) : (
                <Camera className="text-white" size={20} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarUpload(f);
              }}
            />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">{activeLearner.name}</h1>
            <p className="text-white/70 text-sm mt-0.5">
              {t("memberSince", { date: memberSince })}
            </p>
            {level && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white border-none">
                    Level {level.level}
                  </Badge>
                  <span className="text-xs text-white/70">{level.title}</span>
                </div>
                <div className="w-full max-w-xs h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700"
                    style={{
                      width: `${level.requiredXp > 0 ? (level.currentXp / level.requiredXp) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {level.currentXp} / {level.requiredXp} XP to next level
                </p>
              </div>
            )}
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-4">
        {t("stats")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="text-center py-5">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-2">
              <Star className="text-[#7C3AED]" size={20} />
            </div>
            <p className="text-2xl font-extrabold text-[var(--aivo-text)]">
              {level?.level ?? 1}
            </p>
            <p className="text-xs text-[var(--aivo-text-secondary)]">{t("level")}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-5">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-2">
              <Zap className="text-[#7C3AED]" size={20} />
            </div>
            <p className="text-2xl font-extrabold text-[var(--aivo-text)]">
              {xp?.totalXp ?? 0}
            </p>
            <p className="text-xs text-[var(--aivo-text-secondary)]">
              {t("totalXp")}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-5">
            <div className="w-10 h-10 rounded-full bg-[#FFF7ED] dark:bg-[#FB923C]/10 flex items-center justify-center mx-auto mb-2">
              <Flame className="text-orange-500" size={20} />
            </div>
            <p className="text-2xl font-extrabold text-[var(--aivo-text)]">
              {streak?.currentStreak ?? 0}
            </p>
            <p className="text-xs text-[var(--aivo-text-secondary)]">
              {t("dayStreak")}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-5">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] dark:bg-[#FBBF24]/10 flex items-center justify-center mx-auto mb-2">
              <Medal className="text-yellow-500" size={20} />
            </div>
            <p className="text-2xl font-extrabold text-[var(--aivo-text)]">
              {badges.length}
            </p>
            <p className="text-xs text-[var(--aivo-text-secondary)]">{t("badgeCollection")}</p>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Stats */}
      <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-4">
        {t("activity")}
      </h2>
      <Card className="mb-8">
        <CardBody>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--aivo-text-secondary)]">
                {t("totalSessions")}
              </span>
              <span className="text-sm font-semibold text-[var(--aivo-text)]">
                {stats?.totalSessions ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--aivo-text-secondary)]">
                {t("questsCompleted")}
              </span>
              <span className="text-sm font-semibold text-[var(--aivo-text)]">
                {stats?.questsCompleted ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--aivo-text-secondary)]">
                {t("challengesWon")}
              </span>
              <span className="text-sm font-semibold text-[var(--aivo-text)]">
                {stats?.challengesWon ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--aivo-text-secondary)]">
                {t("homeworkHelped")}
              </span>
              <span className="text-sm font-semibold text-[var(--aivo-text)]">
                {stats?.homeworkHelped ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--aivo-text-secondary)]">
                {t("weeklyXp")}
              </span>
              <span className="text-sm font-semibold text-[#7C3AED]">
                {xp?.weeklyXp ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--aivo-text-secondary)]">
                {t("longestStreak")}
              </span>
              <span className="text-sm font-semibold text-orange-500">
                {streak?.longestStreak ?? 0} {t("days")}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recent Badges */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--aivo-text)]">
          {t("recentBadges")}
        </h2>
        {badges.length > 0 && (
          <Link
            href="/learner/badges"
            className="text-sm text-[#7C3AED] hover:text-[#6B3FE8] font-medium"
          >
            {t("viewAll")}
          </Link>
        )}
      </div>

      {badges.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <Trophy className="mx-auto mb-3 text-[#A89BB5] dark:text-[#7B6A94]" size={40} />
            <h3 className="text-base font-semibold text-[var(--aivo-text)] mb-1">
              {t("noBadgesYet")}
            </h3>
            <p className="text-sm text-[var(--aivo-text-secondary)]">
              {t("earnFirstBadge")}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
          {badges.slice(0, 6).map((badge) => (
            <Card key={badge.id} className="hover:shadow-[var(--shadow-card)] transition-all">
              <CardBody className="flex flex-col items-center text-center py-4 px-2">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-2 overflow-hidden">
                  {badge.iconUrl ? (
                    <img
                      src={badge.iconUrl}
                      alt={badge.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Trophy className="text-[#7C3AED]" size={20} />
                  )}
                </div>
                <p className="text-xs font-medium text-[var(--aivo-text)] truncate w-full">
                  {badge.name}
                </p>
                <p className="text-[10px] text-[var(--aivo-text-muted)] mt-0.5">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Avatar Button */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          leftIcon={<Edit3 size={16} />}
          loading={uploading}
        >
          {t("changeAvatar")}
        </Button>
      </div>
    </div>
  );
}
