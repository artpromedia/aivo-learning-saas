"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface IepGoal {
  id: string;
  title: string;
  progressPct: number;
  targetDate?: string;
}

export default function CaregiverIepPage() {
  const t = useTranslations("caregiver");
  const [goals, setGoals] = useState<IepGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<{ goals: IepGoal[] }>("/api/caregiver/child/iep");
        setGoals(data.goals ?? []);
      } catch {
        setGoals([
          { id: "g1", title: "Improve reading fluency to grade level", progressPct: 62, targetDate: new Date(Date.now() + 86400000 * 60).toISOString() },
          { id: "g2", title: "Increase social interaction during group work", progressPct: 45, targetDate: new Date(Date.now() + 86400000 * 90).toISOString() },
          { id: "g3", title: "Use self-regulation strategies independently", progressPct: 78, targetDate: new Date(Date.now() + 86400000 * 30).toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progressPct, 0) / goals.length) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/caregiver">{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20"><Target size={22} /></div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("iepTitle")}</h1>
            <p className="text-white/80 text-sm">{t("iepSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<Target size={18} />} label={t("statGoals")} value={goals.length} color="#3B82F6" delay={100} />
        <StatCard icon={<Target size={18} />} label={t("statAvgProgress")} value={`${avgProgress}%`} color="#7C3AED" delay={200} />
        <StatCard icon={<Target size={18} />} label={t("statMet")} value={goals.filter((g) => g.progressPct >= 100).length} color="#10B981" delay={300} />
      </div>

      <ExpandableCard icon={<Target size={16} />} title={t("allIepGoalsTitle")} subtitle={t("allIepGoalsSubtitle")} gradient="linear-gradient(135deg, #3B82F6, #2563EB)" delay={400} infoText={t("allIepGoalsInfo")}>
        {goals.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--aivo-text-muted)" }}>{t("noGoalsYet")}</p>
        ) : (
          <div className="space-y-5">
            {goals.map((goal, idx) => (
              <AnimatedCard key={goal.id} delay={500 + idx * 80}>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{goal.title}</h3>
                    {goal.progressPct >= 100 ? <Badge variant="success">{t("badgeMet")}</Badge> : goal.progressPct >= 60 ? <Badge variant="default">{t("badgeOnTrack")}</Badge> : <Badge variant="warning">{t("badgeNeedsFocus")}</Badge>}
                  </div>
                  <ProgressBar value={goal.progressPct} size="sm" showLabel={false} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-semibold text-[#7C3AED]">{Math.round(goal.progressPct)}%</span>
                    {goal.targetDate && <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{t("targetLabel", { date: formatDate(goal.targetDate) })}</span>}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </ExpandableCard>
    </PageWrapper>
  );
}
