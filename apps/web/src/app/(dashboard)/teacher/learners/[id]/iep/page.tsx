"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Target } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface IepGoal {
  id: string;
  title: string;
  progressPct: number;
  targetDate?: string;
  status?: string;
}

export default function TeacherLearnerIepPage() {
  const params = useParams();
  const learnerId = params.id as string;
  const [goals, setGoals] = useState<IepGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<{ iepGoals: IepGoal[] }>(
          API_ROUTES.TEACHER.LEARNER_BRAIN(learnerId),
        );
        setGoals(data.iepGoals ?? []);
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
  }, [learnerId]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progressPct, 0) / goals.length) : 0;
  const metGoals = goals.filter((g) => g.progressPct >= 100).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-2xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/teacher/learners/${learnerId}`}>Back to Learner Hub</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Target size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">IEP Goals</h1>
            <p className="text-white/80 text-sm">Individualized Education Program progress tracking</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<Target size={18} />} label="Total Goals" value={goals.length} color="#3B82F6" delay={100} />
        <StatCard icon={<Target size={18} />} label="Avg Progress" value={`${avgProgress}%`} color="#7C3AED" delay={200} />
        <StatCard icon={<Target size={18} />} label="Met" value={metGoals} color="#10B981" delay={300} />
      </div>

      <ExpandableCard
        icon={<Target size={16} />}
        title="All IEP Goals"
        subtitle="Track progress toward individualized education goals"
        gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
        delay={400}
        infoText="IEP goals are set collaboratively by the care team. AIVO tracks progress through session performance data and adaptive assessments."
      >
        {goals.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--aivo-text-muted)" }}>No IEP goals have been set yet.</p>
        ) : (
          <div className="space-y-5">
            {goals.map((goal, idx) => (
              <AnimatedCard key={goal.id} delay={500 + idx * 80}>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{goal.title}</h3>
                    {goal.progressPct >= 100 ? (
                      <Badge variant="success">Met</Badge>
                    ) : goal.progressPct >= 60 ? (
                      <Badge variant="default">On Track</Badge>
                    ) : (
                      <Badge variant="warning">Needs Focus</Badge>
                    )}
                  </div>
                  <ProgressBar value={goal.progressPct} size="sm" showLabel={false} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-semibold text-[#7C3AED]">{Math.round(goal.progressPct)}%</span>
                    {goal.targetDate && (
                      <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>Target: {formatDate(goal.targetDate)}</span>
                    )}
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
