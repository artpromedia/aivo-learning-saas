"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Users, TrendingUp, BookOpen, CreditCard, Calendar, MapPin, Mail, Phone } from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiFetch } from "@/lib/api";

interface DistrictDetail {
  id: string;
  name: string;
  state: string;
  status: "active" | "trial" | "suspended";
  plan: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  learnerCount: number;
  teacherCount: number;
  classroomCount: number;
  avgMastery: number;
  licensesUsed: number;
  licensesTotal: number;
  topTeachers: { name: string; learners: number; mastery: number }[];
  recentActivity: { action: string; timestamp: string }[];
}

export default function DistrictDetailPage() {
  const params = useParams();
  const districtId = params.id as string;
  const [data, setData] = useState<DistrictDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<DistrictDetail>(`/api/admin/platform/districts/${districtId}`);
        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [districtId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (!data) return null;

  const statusColors: Record<string, string> = { active: "success", trial: "warning", suspended: "error" };

  return (
    <PageWrapper>
      <BackLink href="/admin/platform/districts">Back to Districts</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20">
            <Building2 size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{data.name}</h1>
              <Badge variant={statusColors[data.status] as "success" | "warning" | "error" ?? "default"}>{data.status}</Badge>
            </div>
            <p className="text-white/80 text-sm flex items-center gap-1"><MapPin size={14} />{data.state} &middot; {data.plan}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<Users size={18} />} label="Learners" value={data.learnerCount} color="#7C3AED" delay={100} />
        <StatCard icon={<Users size={18} />} label="Teachers" value={data.teacherCount} color="#3B82F6" delay={200} />
        <StatCard icon={<BookOpen size={18} />} label="Classrooms" value={data.classroomCount} color="#2DD4BF" delay={300} />
        <StatCard icon={<TrendingUp size={18} />} label="Avg Mastery" value={`${data.avgMastery}%`} color="#10B981" delay={400} />
      </div>

      <ExpandableCard
        icon={<Mail size={16} />}
        title="Contact Information"
        subtitle="District administrator details"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={500}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--aivo-bg)" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "var(--aivo-text-muted)" }}>Contact Name</p>
            <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{data.contactName}</p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--aivo-bg)" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "var(--aivo-text-muted)" }}>Email</p>
            <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{data.contactEmail}</p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--aivo-bg)" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "var(--aivo-text-muted)" }}>Phone</p>
            <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{data.contactPhone}</p>
          </div>
        </div>
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard
          icon={<CreditCard size={16} />}
          title="License Usage"
          subtitle={`${data.licensesUsed} of ${data.licensesTotal} licenses used`}
          gradient="linear-gradient(135deg, #F59E0B, #D97706)"
          delay={600}
        >
          <div className="mb-2 flex justify-between text-sm">
            <span style={{ color: "var(--aivo-text)" }}>{data.licensesUsed} used</span>
            <span style={{ color: "var(--aivo-text-muted)" }}>{data.licensesTotal} total</span>
          </div>
          <ProgressBar value={Math.round((data.licensesUsed / data.licensesTotal) * 100)} />
        </ExpandableCard>
      </div>

      <div className="mt-6">
        <ExpandableCard
          icon={<Users size={16} />}
          title={`Top Teachers (${data.topTeachers.length})`}
          subtitle="Highest-performing teachers in this district"
          gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
          delay={700}
        >
          <div className="space-y-3">
            {data.topTeachers.map((teacher, idx) => (
              <AnimatedCard key={teacher.name} delay={800 + idx * 60}>
                <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg, #2DD4BF, #14B8A6)" }}>
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>{teacher.name}</h3>
                    <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{teacher.learners} learners</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#7C3AED" }}>{teacher.mastery}%</span>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}
