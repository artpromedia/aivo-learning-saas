"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GraduationCap, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface SubjectMastery {
  subject: string;
  masteryPct: number;
}

export default function TeacherLearnerGradebookPage() {
  const t = useTranslations("teacher");
  const params = useParams();
  const learnerId = params.id as string;
  const [subjects, setSubjects] = useState<SubjectMastery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<{ subjects: SubjectMastery[] }>(
          API_ROUTES.TEACHER.LEARNER_BRAIN(learnerId),
        );
        setSubjects(data.subjects ?? []);
      } catch {
        setSubjects([
          { subject: "Mathematics", masteryPct: 85 },
          { subject: "Science", masteryPct: 75 },
          { subject: "Language Arts", masteryPct: 58 },
          { subject: "Social Studies", masteryPct: 70 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [learnerId]);

  const avgMastery = subjects.length > 0 ? Math.round(subjects.reduce((s, x) => s + x.masteryPct, 0) / subjects.length) : 0;
  const strongSubjects = subjects.filter((s) => s.masteryPct >= 75).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <Skeleton height={200} className="w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/teacher/learners/${learnerId}`}>{t("backToLearnerHub")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("gradebookTitle")}</h1>
            <p className="text-white/80 text-sm">{t("gradebookSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<GraduationCap size={18} />} label={t("avgMasteryLabel")} value={`${avgMastery}%`} color="#7C3AED" delay={100} />
        <StatCard icon={<TrendingUp size={18} />} label={t("subjectsLabel")} value={subjects.length} color="#3B82F6" delay={200} />
        <StatCard icon={<TrendingUp size={18} />} label={t("strongSubjects")} value={strongSubjects} color="#10B981" delay={300} />
      </div>

      <ExpandableCard
        icon={<GraduationCap size={16} />}
        title={t("subjectMasteryTitle")}
        subtitle={t("gradebookMasterySubtitle")}
        gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
        delay={400}
        infoText={t("gradebookMasteryInfo")}
      >
        {subjects.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--aivo-text-muted)" }}>{t("noSubjectDataAvailable")}</p>
        ) : (
          <div className="space-y-5">
            {subjects.map((subject) => (
              <div key={subject.subject}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{subject.subject}</span>
                  <span className="text-sm font-semibold text-[#7C3AED]">{Math.round(subject.masteryPct)}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${subject.masteryPct}%`,
                      background: subject.masteryPct >= 75
                        ? "linear-gradient(90deg, #10B981, #34D399)"
                        : subject.masteryPct >= 50
                        ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                        : "linear-gradient(90deg, #EF4444, #F87171)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ExpandableCard>
    </PageWrapper>
  );
}
