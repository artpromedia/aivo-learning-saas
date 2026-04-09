"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ChevronRight, AlertTriangle, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, EmptyState, AnimatedCard, StatCard } from "@/components/ui/PageDesign";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";

interface ClassroomSummary {
  id: string;
  name: string;
  gradeBand: string;
  learnerCount: number;
  avgMasteryPct: number;
  atRiskCount: number;
}

export default function TeacherDashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const data = await apiFetch<ClassroomSummary[]>("/api/teacher/classrooms");
        setClassrooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadClassrooms"));
      } finally {
        setLoading(false);
      }
    }
    fetchClassrooms();
  }, []);

  const totalLearners = classrooms.reduce((sum, c) => sum + c.learnerCount, 0);
  const avgMastery = classrooms.length > 0 ? Math.round(classrooms.reduce((sum, c) => sum + c.avgMasteryPct, 0) / classrooms.length) : 0;
  const totalAtRisk = classrooms.reduce((sum, c) => sum + c.atRiskCount, 0);

  return (
    <PageWrapper>
      <PurpleGradientHeader className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{t("myClassrooms")}</h1>
            <p className="mt-0.5 text-white/80 font-medium text-sm">
              {t("teacherWelcomeBack", { name: user?.name ?? "Teacher" })}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-2xl text-sm font-medium" style={{ backgroundColor: "#FFE0E0", color: "#991B1B", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      {!loading && classrooms.length > 0 && (
        <div className="grid gap-3 grid-cols-3 mb-8">
          <StatCard icon={<Users size={18} />} label={t("learners")} value={totalLearners} color="#7C3AED" delay={100} />
          <StatCard icon={<GraduationCap size={18} />} label={t("avgMastery")} value={`${avgMastery}%`} color="#10B981" delay={200} />
          <StatCard icon={<AlertTriangle size={18} />} label={t("atRisk")} value={totalAtRisk} color="#F59E0B" delay={300} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="space-y-3">
                <Skeleton height={20} className="w-40" />
                <Skeleton height={14} className="w-24" />
                <div className="flex gap-4 mt-4">
                  <Skeleton height={40} className="w-20" />
                  <Skeleton height={40} className="w-20" />
                  <Skeleton height={40} className="w-20" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={32} />}
          title={t("noClassroomsYet")}
          description={t("noClassroomsDescription")}
          delay={200}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom, idx) => (
            <AnimatedCard key={classroom.id} delay={400 + idx * 100}>
              <Link href={`/teacher/classrooms/${classroom.id}`}>
                <Card className="hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer group h-full hover:scale-[1.02]">
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: "var(--aivo-text)" }}>{classroom.name}</h3>
                        <Badge variant="secondary" className="mt-1.5">{classroom.gradeBand}</Badge>
                      </div>
                      <ChevronRight className="shrink-0 transition-all group-hover:translate-x-1" size={20} style={{ color: "var(--aivo-text-muted)" }} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <div className="text-center p-2.5 rounded-2xl" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                        <div className="flex items-center justify-center gap-1" style={{ color: "var(--aivo-purple-500)" }}>
                          <Users size={14} />
                          <span className="text-sm font-bold">{classroom.learnerCount}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "var(--aivo-text-muted)" }}>{t("learners")}</span>
                      </div>
                      <div className="text-center p-2.5 rounded-2xl" style={{ backgroundColor: "#D1FAE5" }}>
                        <div className="flex items-center justify-center gap-1" style={{ color: "#059669" }}>
                          <GraduationCap size={14} />
                          <span className="text-sm font-bold">{Math.round(classroom.avgMasteryPct)}%</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "var(--aivo-text-muted)" }}>{t("avgMastery")}</span>
                      </div>
                      <div className="text-center p-2.5 rounded-2xl" style={{ backgroundColor: "#FEF3C7" }}>
                        <div className="flex items-center justify-center gap-1" style={{ color: "#D97706" }}>
                          <AlertTriangle size={14} />
                          <span className="text-sm font-bold">{classroom.atRiskCount}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "var(--aivo-text-muted)" }}>{t("atRisk")}</span>
                      </div>
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
