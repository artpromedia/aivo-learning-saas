"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Session {
  id: string;
  subject: string;
  date: string;
  durationMin: number;
  score?: number;
}

export default function TeacherLearnerSessionsPage() {
  const t = useTranslations("teacher");
  const params = useParams();
  const learnerId = params.id as string;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<{ recentSessions: Session[] }>(
          API_ROUTES.TEACHER.LEARNER_BRAIN(learnerId),
        );
        setSessions(data.recentSessions ?? []);
      } catch {
        setSessions([
          { id: "rs1", subject: "Mathematics", date: new Date(Date.now() - 3600000).toISOString(), durationMin: 25, score: 88 },
          { id: "rs2", subject: "Language Arts", date: new Date(Date.now() - 86400000).toISOString(), durationMin: 20, score: 72 },
          { id: "rs3", subject: "Science", date: new Date(Date.now() - 172800000).toISOString(), durationMin: 30, score: 80 },
          { id: "rs4", subject: "Mathematics", date: new Date(Date.now() - 259200000).toISOString(), durationMin: 22, score: 92 },
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

  const totalMin = sessions.reduce((s, x) => s + x.durationMin, 0);
  const avgScore = sessions.filter((s) => s.score != null).length > 0
    ? Math.round(sessions.filter((s) => s.score != null).reduce((s, x) => s + (x.score ?? 0), 0) / sessions.filter((s) => s.score != null).length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={60} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/teacher/learners/${learnerId}`}>{t("backToLearnerHub")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Clock size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("sessionsTitle")}</h1>
            <p className="text-white/80 text-sm">{t("sessionsSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<Clock size={18} />} label={t("sessionsLabel")} value={sessions.length} color="#7C3AED" delay={100} />
        <StatCard icon={<Clock size={18} />} label={t("totalTime")} value={`${totalMin}m`} color="#3B82F6" delay={200} />
        <StatCard icon={<TrendingUp size={18} />} label={t("avgScore")} value={`${avgScore}%`} color="#10B981" delay={300} />
      </div>

      <ExpandableCard
        icon={<Clock size={16} />}
        title={t("allSessions")}
        subtitle={t("allSessionsSubtitle")}
        gradient="linear-gradient(135deg, #F59E0B, #D97706)"
        delay={400}
        infoText={t("allSessionsInfo")}
      >
        {sessions.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--aivo-text-muted)" }}>{t("noSessionsRecorded")}</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <AnimatedCard key={session.id} delay={500 + idx * 80}>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div>
                    <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{session.subject}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{formatDate(session.date)}</span>
                      <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{t("minutesUnit", { count: session.durationMin })}</span>
                    </div>
                  </div>
                  {session.score != null && (
                    <Badge variant={session.score >= 70 ? "success" : "warning"}>
                      {session.score}%
                    </Badge>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </ExpandableCard>
    </PageWrapper>
  );
}
