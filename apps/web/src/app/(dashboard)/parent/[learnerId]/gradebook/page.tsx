"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { GraduationCap, RefreshCw, TrendingUp, BookOpen } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface SubjectMastery {
  subject: string;
  currentMastery: number;
  trend: "up" | "down" | "stable";
  history: { date: string; mastery: number }[];
}

interface GradebookData {
  subjects: SubjectMastery[];
  overallMastery: number;
  totalSessions: number;
}

const SUBJECT_COLORS = ["#7C3AED", "#38B2AC", "#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#EC4899", "#8B5CF6"];

export default function GradebookPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const t = useTranslations("dashboard");

  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGradebook() {
      try {
        const result = await apiFetch<GradebookData>(API_ROUTES.GRADEBOOK.MASTERY(learnerId));
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadGradebook"));
      } finally {
        setLoading(false);
      }
    }

    fetchGradebook();
  }, [learnerId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <Skeleton height={300} className="w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  const chartSubjects = selectedSubject ? data?.subjects.filter((s) => s.subject === selectedSubject) : data?.subjects;
  const allDates = new Set<string>();
  data?.subjects.forEach((s) => s.history.forEach((h) => allDates.add(h.date)));
  const sortedDates = Array.from(allDates).sort();

  const chartData = sortedDates.map((date) => {
    const entry: Record<string, string | number> = { date };
    (chartSubjects ?? []).forEach((subject) => {
      const point = subject.history.find((h) => h.date === date);
      if (point) entry[subject.subject] = point.mastery;
    });
    return entry;
  });

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}`}>{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("gradebook")}</h1>
            <p className="text-white/80 text-sm">Track how your child is mastering each subject over time</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 mb-8">
        <StatCard icon={<TrendingUp size={18} />} label={t("overallMastery")} value={`${data?.overallMastery ?? 0}%`} color="#7C3AED" delay={100} />
        <StatCard icon={<BookOpen size={18} />} label={t("totalSessions")} value={data?.totalSessions ?? 0} color="#2DD4BF" delay={200} />
      </div>

      <ExpandableCard
        icon={<TrendingUp size={16} />}
        title={t("masteryOverTime")}
        subtitle="See how learning improves week by week"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={300}
        infoText="This chart shows your child's mastery percentage for each subject over time. An upward trend means they're improving! Use the subject filters to focus on one area."
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedSubject === null
                ? "bg-[#7C3AED] text-white"
                : "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text-secondary)] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C]"
            }`}
          >
            {t("allSubjects")}
          </button>
          {data?.subjects.map((s) => (
            <button
              key={s.subject}
              onClick={() => setSelectedSubject(s.subject)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedSubject === s.subject
                  ? "bg-[#7C3AED] text-white"
                  : "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text-secondary)] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C]"
              }`}
            >
              {s.subject}
            </button>
          ))}
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Legend />
              {(chartSubjects ?? []).map((subject, idx) => (
                <Line key={subject.subject} type="monotone" dataKey={subject.subject} stroke={SUBJECT_COLORS[idx % SUBJECT_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12" style={{ color: "var(--aivo-text-secondary)" }}>
            {t("noMasteryDataYet")}
          </div>
        )}
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard
          icon={<GraduationCap size={16} />}
          title={t("subjectBreakdown")}
          subtitle="Detailed view of each subject's progress"
          gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
          delay={400}
          infoText="Each card shows a subject's current mastery level and whether it's trending up, down, or stable. 'Improving' means your child is getting better over time!"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.subjects.map((subject, idx) => (
              <div key={subject.subject} className="p-4 rounded-3xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }} />
                    <h4 className="font-bold" style={{ color: "var(--aivo-text)" }}>{subject.subject}</h4>
                  </div>
                  <Badge variant={subject.trend === "up" ? "success" : subject.trend === "down" ? "error" : "secondary"}>
                    {subject.trend === "up" ? t("improving") : subject.trend === "down" ? t("needsFocus") : t("stable")}
                  </Badge>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-extrabold" style={{ color: "var(--aivo-text)" }}>{subject.currentMastery}%</span>
                  <span className="text-sm mb-0.5" style={{ color: "var(--aivo-text-secondary)" }}>{t("mastery")}</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${subject.currentMastery}%`,
                    backgroundColor: SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
                  }} />
                </div>
              </div>
            ))}
          </div>
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}
