"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trophy, ChevronRight, Flame, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonAvatar } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface LearnerSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  functioningLevel: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  currentStreak: number;
  totalXp: number;
  level: number;
  lastActiveAt: string;
  todayProgress: number;
}

const levelColors: Record<string, { variant: "default" | "teal" | "sunny" | "coral" | "pink" }> = {
  STANDARD: { variant: "teal" },
  SUPPORTED: { variant: "sunny" },
  LOW_VERBAL: { variant: "coral" },
  NON_VERBAL: { variant: "pink" },
  PRE_SYMBOLIC: { variant: "default" },
};

export default function ParentDashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLearners() {
      try {
        const data = await apiFetch<{ learners: LearnerSummary[] }>(API_ROUTES.LEARNER.LIST);
        setLearners(data.learners ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadLearners"));
      } finally {
        setLoading(false);
      }
    }

    fetchLearners();
  }, []);

  const levelLabel = (fl: string) => {
    switch (fl) {
      case "STANDARD": return t("standard");
      case "SUPPORTED": return t("supported");
      case "LOW_VERBAL": return t("lowVerbal");
      case "NON_VERBAL": return t("nonVerbal");
      case "PRE_SYMBOLIC": return t("preSymbolic");
      default: return fl;
    }
  };

  return (
    <PageWrapper>
      <PurpleGradientHeader className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {t("welcomeBack", { name: user?.name?.split(" ")[0] ?? "Parent" })}
            </h1>
            <p className="mt-0.5 text-white/80 font-medium text-sm">
              {t("childrenOverview")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-2xl text-sm font-medium" style={{ backgroundColor: "#FFE0E0", color: "#991B1B", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      <AnimatedCard delay={100}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
              {t("yourChildren")}
            </h2>
            <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>
              {t("tapChildToSee")}
            </p>
          </div>
          <Link href="/add-child">
            <Button size="sm" leftIcon={<Plus size={16} />}>
              {t("addChild")}
            </Button>
          </Link>
        </div>
      </AnimatedCard>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardBody className="flex items-center gap-4">
                <SkeletonAvatar size={56} />
                <div className="flex-1 space-y-2">
                  <Skeleton height={18} className="w-32" />
                  <Skeleton height={14} className="w-48" />
                  <Skeleton height={14} className="w-24" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : learners.length === 0 ? (
        <EmptyState
          icon={<Plus size={32} />}
          title={t("noChildrenYet")}
          description={t("addChildPrompt")}
          action={
            <Link href="/add-child">
              <Button leftIcon={<Plus size={18} />}>{t("addYourFirstChild")}</Button>
            </Link>
          }
          delay={200}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {learners.map((learner, idx) => (
            <AnimatedCard key={learner.id} delay={200 + idx * 100}>
              <Link href={`/parent/${learner.id}`}>
                <Card className="hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer group hover:scale-[1.01]">
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7, #2DD4BF)" }}>
                        {learner.avatarUrl ? (
                          <img src={learner.avatarUrl} alt={learner.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          learner.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-lg font-bold truncate" style={{ color: "var(--aivo-text)" }}>
                            {learner.name}
                          </h3>
                          <Badge variant={levelColors[learner.functioningLevel]?.variant ?? "default"}>
                            {levelLabel(learner.functioningLevel)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <div className="text-center p-2 rounded-2xl" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                            <div className="flex items-center justify-center gap-1" style={{ color: "var(--aivo-purple-500)" }}>
                              <Trophy size={14} />
                              <span className="text-sm font-bold">{learner.totalXp}</span>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: "var(--aivo-text-muted)" }}>{t("xp")}</span>
                          </div>
                          <div className="text-center p-2 rounded-2xl" style={{ backgroundColor: "#FFF7ED" }}>
                            <div className="flex items-center justify-center gap-1" style={{ color: "#FB923C" }}>
                              <Flame size={14} />
                              <span className="text-sm font-bold">{learner.currentStreak}</span>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: "var(--aivo-text-muted)" }}>{t("streak")}</span>
                          </div>
                          <div className="text-center p-2 rounded-2xl" style={{ backgroundColor: "#CCFBF1" }}>
                            <div className="flex items-center justify-center gap-1" style={{ color: "#2DD4BF" }}>
                              <Star size={14} />
                              <span className="text-sm font-bold">{t("lvPrefix", { level: learner.level })}</span>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: "var(--aivo-text-muted)" }}>{t("level")}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <ProgressBar value={learner.todayProgress} showLabel={true} size="sm" color="rainbow" />
                        </div>
                      </div>
                      <ChevronRight className="shrink-0 mt-1 transition-all group-hover:translate-x-1" size={20} style={{ color: "var(--aivo-text-muted)" }} />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
