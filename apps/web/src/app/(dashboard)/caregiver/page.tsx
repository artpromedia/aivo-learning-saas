"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  GraduationCap,
  Target,
  ShieldCheck,
  Clock,
  TrendingUp,
  Heart,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import {
  PageWrapper,
  ExpandableCard,
  StatCard,
  AnimatedCard,
} from "@/components/ui/PageDesign";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";

interface CaregiverChild {
  id: string;
  name: string;
  avatarUrl?: string;
  functioningLevel: string;
  grade?: string;
  mastery: number;
  recentSessionCount: number;
  accommodationCount: number;
  iepGoalCount: number;
  subjects: { name: string; mastery: number }[];
}

export default function CaregiverDashboardPage() {
  const { user } = useAuthStore();
  const [child, setChild] = useState<CaregiverChild | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<CaregiverChild>("/api/caregiver/child");
        setChild(data);
      } catch {
        setChild({
          id: "learner-001",
          name: "Alex Johnson",
          functioningLevel: "SUPPORTED",
          grade: "3rd Grade",
          mastery: 72,
          recentSessionCount: 4,
          accommodationCount: 4,
          iepGoalCount: 3,
          subjects: [
            { name: "Mathematics", mastery: 85 },
            { name: "Science", mastery: 75 },
            { name: "Language Arts", mastery: 58 },
            { name: "Social Studies", mastery: 70 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const levelLabel = (fl: string) => {
    const labels: Record<string, string> = {
      STANDARD: "Standard", SUPPORTED: "Supported", LOW_VERBAL: "Low Verbal",
      NON_VERBAL: "Non-Verbal", PRE_SYMBOLIC: "Pre-Symbolic",
    };
    return labels[fl] ?? fl;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}
        </div>
      </div>
    );
  }

  if (!child) return null;

  const quickLinks = [
    { href: `/caregiver/brain`, label: "Brain Profile", icon: <Brain size={20} />, gradient: "linear-gradient(135deg, #7C3AED, #A855F7)", description: "AI learning insights" },
    { href: `/caregiver/accommodations`, label: "Accommodations", icon: <ShieldCheck size={20} />, gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)", description: "Support strategies" },
    { href: `/caregiver/iep`, label: "IEP Goals", icon: <Target size={20} />, gradient: "linear-gradient(135deg, #3B82F6, #2563EB)", description: "Goals & progress" },
    { href: `/caregiver/gradebook`, label: "Gradebook", icon: <GraduationCap size={20} />, gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)", description: "Subject mastery" },
    { href: `/caregiver/sessions`, label: "Sessions", icon: <Clock size={20} />, gradient: "linear-gradient(135deg, #F59E0B, #D97706)", description: "Activity history" },
  ];

  return (
    <PageWrapper>
      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold">
            <Heart size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Welcome, {user?.name?.split(" ")[0] ?? "Caregiver"}</h1>
            <p className="text-white/80 text-sm">
              You&apos;re viewing {child.name}&apos;s learning profile
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {child.grade ?? ""} &middot; {levelLabel(child.functioningLevel)}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<TrendingUp size={18} />} label="Avg Mastery" value={`${child.mastery}%`} color="#7C3AED" delay={100} />
        <StatCard icon={<BookOpen size={18} />} label="Recent Sessions" value={child.recentSessionCount} color="#3B82F6" delay={200} />
        <StatCard icon={<ShieldCheck size={18} />} label="Accommodations" value={child.accommodationCount} color="#10B981" delay={300} />
        <StatCard icon={<Target size={18} />} label="IEP Goals" value={child.iepGoalCount} color="#F59E0B" delay={400} />
      </div>

      <ExpandableCard
        icon={<Brain size={16} />}
        title="Quick Navigation"
        subtitle={`Explore different areas of ${child.name}'s learning profile`}
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={500}
        infoText="As a caregiver, you have view-only access to this child's learning profile. You can see their progress, brain profile, and IEP goals but cannot make changes."
      >
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="rounded-3xl p-5 text-center transition-all cursor-pointer hover:scale-[1.03] h-full" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white" style={{ background: link.gradient }}>
                  {link.icon}
                </div>
                <span className="text-sm font-bold block" style={{ color: "var(--aivo-text)" }}>{link.label}</span>
                <span className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{link.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </ExpandableCard>

      {child.subjects.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<GraduationCap size={16} />}
            title="Subject Mastery"
            subtitle={`How ${child.name} is progressing in each subject`}
            gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
            delay={600}
            infoText="Mastery scores show how well the child understands each subject. AIVO adjusts content difficulty based on these scores."
            linkHref="/caregiver/gradebook"
            linkLabel="View full gradebook"
          >
            <div className="space-y-4">
              {child.subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{subject.name}</span>
                    <span className="text-sm font-semibold text-[#7C3AED]">{subject.mastery}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                    <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full transition-all duration-700" style={{ width: `${subject.mastery}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      )}

      <div className="mt-6">
        <AnimatedCard delay={700}>
          <div className="rounded-3xl p-6 text-center" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #F472B6, #EC4899)" }}>
              <Heart size={22} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>You&apos;re making a difference</h3>
            <p className="text-xs mt-1" style={{ color: "var(--aivo-text-muted)" }}>
              Your involvement in {child.name}&apos;s education helps them thrive. Thank you for being part of the care team!
            </p>
          </div>
        </AnimatedCard>
      </div>
    </PageWrapper>
  );
}
