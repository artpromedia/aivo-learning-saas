"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Brain, Lightbulb, BookOpen, GraduationCap, Bot, TrendingUp, Trophy,
  Flame, Home, Activity, Users, Settings, FileText,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, SectionHeader, AnimatedCard } from "@/components/ui/PageDesign";
import { useEngagement } from "@/hooks/useEngagement";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";
import { useRouter } from "next/navigation";

interface LearnerDetail {
  id: string;
  name: string;
  avatarUrl?: string;
  functioningLevel: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  dateOfBirth: string;
  enrolledGrade?: string;
  enrolledSubjects?: string[];
  languagePreference?: string;
  preferences?: {
    theme?: string;
    reduceAnimations?: boolean;
    fontSize?: "small" | "medium" | "large";
    soundEnabled?: boolean;
  };
}

interface ProgressData {
  overallMastery: number;
  sessionsThisWeek: number;
  averageAccuracy: number;
  recentSubjects: { name: string; mastery: number }[];
}

export default function ChildDashboardPage() {
  const t = useTranslations("dashboard");
  const params = useParams();
  const learnerId = params.learnerId as string;

  const [learner, setLearner] = useState<LearnerDetail | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { xp, streak, level, isLoading: engagementLoading } = useEngagement(learnerId);
  const setActiveLearner = useLearnerStore((s) => s.setActiveLearner);
  const router = useRouter();

  const handleViewLearnerDashboard = () => {
    if (learner) {
      setActiveLearner({
        id: learner.id,
        name: learner.name,
        avatarUrl: learner.avatarUrl,
        dateOfBirth: learner.dateOfBirth,
        functioningLevel: learner.functioningLevel,
        gradeLevel: learner.enrolledGrade,
        enrolledSubjects: learner.enrolledSubjects,
        languagePreference: learner.languagePreference,
        preferences: learner.preferences ?? {},
      });
    }
    router.push("/learner");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [learnerRes, progressData] = await Promise.all([
          apiFetch<{ learner: LearnerDetail }>(API_ROUTES.LEARNER.DETAIL(learnerId)),
          apiFetch<ProgressData>(API_ROUTES.LEARNER.PROGRESS(learnerId)).catch(() => null),
        ]);
        setLearner(learnerRes.learner);
        setProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [learnerId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

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

  const quickLinks = [
    { href: `/parent/${learnerId}/brain`, label: t("brainProfile"), icon: <Brain size={20} />, gradient: "linear-gradient(135deg, #7C3AED, #A855F7)", description: "AI learning insights" },
    { href: `/parent/${learnerId}/functioning-level`, label: t("functioningLevel", { defaultValue: "Functioning Level" }), icon: <Activity size={20} />, gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)", description: "Support level" },
    { href: `/parent/${learnerId}/recommendations`, label: t("recommendations"), icon: <Lightbulb size={20} />, gradient: "linear-gradient(135deg, #F59E0B, #D97706)", description: "AI suggestions" },
    { href: `/parent/${learnerId}/gradebook`, label: t("gradebook"), icon: <GraduationCap size={20} />, gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)", description: "Subject mastery" },
    { href: `/parent/${learnerId}/iep`, label: "IEP Goals", icon: <FileText size={20} />, gradient: "linear-gradient(135deg, #3B82F6, #2563EB)", description: "Goals & documents" },
    { href: `/parent/${learnerId}/tutors`, label: t("tutors"), icon: <Bot size={20} />, gradient: "linear-gradient(135deg, #38BDF8, #0EA5E9)", description: "AI tutors" },
    { href: `/parent/${learnerId}/collaboration`, label: "Team", icon: <Users size={20} />, gradient: "linear-gradient(135deg, #10B981, #059669)", description: "Care team" },
    { href: `/parent/${learnerId}/settings`, label: "Settings", icon: <Settings size={20} />, gradient: "linear-gradient(135deg, #6B7280, #4B5563)", description: "Privacy & data" },
  ];

  return (
    <PageWrapper>
      <BackLink href="/parent">{t("backToAllChildren")}</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold">
            {learner?.avatarUrl ? (
              <img src={learner.avatarUrl} alt={learner.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              learner?.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{learner?.name}</h1>
            <p className="text-white/80 text-sm">
              {learner?.enrolledGrade ?? t("gradeNotSet")} &middot; {levelLabel(learner?.functioningLevel ?? "STANDARD")}
            </p>
            <p className="text-white/60 text-xs mt-0.5">Your child&apos;s learning hub — everything in one place</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<Trophy size={18} />} label="Total XP" value={xp?.totalXp ?? "--"} color="#7C3AED" delay={100} />
        <StatCard icon={<Flame size={18} />} label="Day Streak" value={streak?.currentStreak ?? "--"} color="#FB923C" delay={200} />
        <StatCard icon={<TrendingUp size={18} />} label="Accuracy" value={`${progress?.averageAccuracy ?? "--"}%`} color="#2DD4BF" delay={300} />
        <StatCard icon={<BookOpen size={18} />} label="Sessions This Week" value={progress?.sessionsThisWeek ?? "--"} color="#3B82F6" delay={400} />
      </div>

      <ExpandableCard
        icon={<Brain size={16} />}
        title="Quick Navigation"
        subtitle="Jump to any section of your child's dashboard"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={500}
        infoText="These shortcuts take you to different areas of your child's learning profile. Each section shows different aspects of how AIVO is helping your child learn."
      >
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link, idx) =>
            "isLearnerView" in link ? (
              <div
                key={link.href}
                onClick={learner ? handleViewLearnerDashboard : undefined}
                className={`rounded-2xl p-4 text-center transition-all cursor-pointer hover:scale-[1.03] ${learner ? "" : "opacity-50 cursor-not-allowed"}`}
                style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}
              >
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white" style={{ background: link.gradient }}>
                  {link.icon}
                </div>
                <span className="text-sm font-bold block" style={{ color: "var(--aivo-text)" }}>{link.label}</span>
                <span className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{link.description}</span>
              </div>
            ) : (
              <Link key={link.href} href={link.href}>
                <div className="rounded-2xl p-4 text-center transition-all cursor-pointer hover:scale-[1.03] h-full"
                  style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white" style={{ background: link.gradient }}>
                    {link.icon}
                  </div>
                  <span className="text-sm font-bold block" style={{ color: "var(--aivo-text)" }}>{link.label}</span>
                  <span className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{link.description}</span>
                </div>
              </Link>
            ),
          )}
          <div
            onClick={learner ? handleViewLearnerDashboard : undefined}
            className={`rounded-2xl p-4 text-center transition-all cursor-pointer hover:scale-[1.03] ${learner ? "" : "opacity-50 cursor-not-allowed"}`}
            style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}
          >
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #34D399, #10B981)" }}>
              <Home size={20} />
            </div>
            <span className="text-sm font-bold block" style={{ color: "var(--aivo-text)" }}>{t("learnerDashboard", { defaultValue: "Learner View" })}</span>
            <span className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>See as learner</span>
          </div>
        </div>
      </ExpandableCard>

      {progress?.recentSubjects && progress.recentSubjects.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<GraduationCap size={16} />}
            title="Subject Mastery"
            subtitle="How your child is progressing in each subject"
            gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
            delay={600}
            infoText="This shows how well your child has mastered each subject. Higher percentages mean stronger understanding. AIVO adjusts difficulty based on these scores."
            linkHref={`/parent/${learnerId}/gradebook`}
            linkLabel="View full gradebook"
          >
            <div className="space-y-4">
              {progress.recentSubjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>
                      {subject.name}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#7C3AED" }}>
                      {subject.mastery}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full transition-all duration-700"
                      style={{ width: `${subject.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      )}
    </PageWrapper>
  );
}
