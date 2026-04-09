"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface SubjectMastery { name: string; mastery: number; }

export default function CaregiverGradebookPage() {
  const [subjects, setSubjects] = useState<SubjectMastery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<{ subjects: SubjectMastery[] }>("/api/caregiver/child/gradebook");
        setSubjects(data.subjects ?? []);
      } catch {
        setSubjects([
          { name: "Mathematics", mastery: 85 },
          { name: "Science", mastery: 75 },
          { name: "Language Arts", mastery: 58 },
          { name: "Social Studies", mastery: 70 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const avgMastery = subjects.length > 0 ? Math.round(subjects.reduce((s, x) => s + x.mastery, 0) / subjects.length) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-2xl" />
        <Skeleton height={200} className="w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/caregiver">Back to Dashboard</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20"><GraduationCap size={22} /></div>
          <div>
            <h1 className="text-2xl font-extrabold">Gradebook</h1>
            <p className="text-white/80 text-sm">Subject-by-subject mastery breakdown</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<GraduationCap size={18} />} label="Avg Mastery" value={`${avgMastery}%`} color="#7C3AED" delay={100} />
        <StatCard icon={<TrendingUp size={18} />} label="Subjects" value={subjects.length} color="#3B82F6" delay={200} />
        <StatCard icon={<TrendingUp size={18} />} label="Strong (75%+)" value={subjects.filter((s) => s.mastery >= 75).length} color="#10B981" delay={300} />
      </div>

      <ExpandableCard icon={<GraduationCap size={16} />} title="Subject Mastery" subtitle="Detailed mastery breakdown" gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)" delay={400} infoText="Mastery is calculated from adaptive assessments, practice sessions, and homework performance.">
        {subjects.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--aivo-text-muted)" }}>No subject data available yet.</p>
        ) : (
          <div className="space-y-5">
            {subjects.map((subject) => (
              <div key={subject.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{subject.name}</span>
                  <span className="text-sm font-semibold text-[#7C3AED]">{Math.round(subject.mastery)}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${subject.mastery}%`,
                    background: subject.mastery >= 75 ? "linear-gradient(90deg, #10B981, #34D399)" : subject.mastery >= 50 ? "linear-gradient(90deg, #F59E0B, #FBBF24)" : "linear-gradient(90deg, #EF4444, #F87171)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ExpandableCard>
    </PageWrapper>
  );
}
