"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  BookOpen,
  Upload,
  Send,
  Clock,
  Target,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  Activity,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import {
  PageWrapper,
  BackLink,
  ExpandableCard,
  StatCard,
  AnimatedCard,
} from "@/components/ui/PageDesign";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface SubjectMastery {
  subject: string;
  masteryPct: number;
}

interface Accommodation {
  id: string;
  label: string;
  description?: string;
}

interface IepGoal {
  id: string;
  title: string;
  progressPct: number;
  targetDate?: string;
}

interface Session {
  id: string;
  subject: string;
  date: string;
  durationMin: number;
  score?: number;
}

interface LearnerBrain {
  id: string;
  name: string;
  functioningLevel: string;
  subjects: SubjectMastery[];
  accommodations: Accommodation[];
  iepGoals: IepGoal[];
  recentSessions: Session[];
}

export default function LearnerHubPage() {
  const t = useTranslations("teacher");
  const params = useParams();
  const learnerId = params.id as string;

  const [brain, setBrain] = useState<LearnerBrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [insightText, setInsightText] = useState("");
  const [submittingInsight, setSubmittingInsight] = useState(false);
  const [insightSuccess, setInsightSuccess] = useState(false);

  const [uploadingIep, setUploadingIep] = useState(false);
  const [iepSuccess, setIepSuccess] = useState(false);
  const iepFileRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchBrain() {
      try {
        const data = await apiFetch<LearnerBrain>(
          API_ROUTES.TEACHER.LEARNER_BRAIN(learnerId),
        );
        setBrain(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("failedToLoadLearner"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBrain();
  }, [learnerId]);

  const handleSubmitInsight = async () => {
    if (!insightText.trim()) return;
    setSubmittingInsight(true);
    setInsightSuccess(false);
    try {
      await apiFetch(API_ROUTES.TEACHER.LEARNER_INSIGHTS(learnerId), {
        method: "POST",
        body: JSON.stringify({ text: insightText.trim() }),
      });
      setInsightText("");
      setInsightSuccess(true);
      setTimeout(() => setInsightSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSubmit"));
    } finally {
      setSubmittingInsight(false);
    }
  };

  const handleIepUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIep(true);
    setIepSuccess(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${API_ROUTES.TEACHER.LEARNER_IEP_UPLOAD(learnerId)}`,
        { method: "POST", credentials: "include", body: formData },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Upload failed: ${res.status}`);
      }
      setIepSuccess(true);
      setTimeout(() => setIepSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToUploadIep"));
    } finally {
      setUploadingIep(false);
      if (iepFileRef.current) iepFileRef.current.value = "";
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const levelLabel = (level: string) => {
    const labels: Record<string, string> = {
      level1: t("levelNeedsSupport"),
      level2: t("levelProgressing"),
      level3: t("levelOnTrack"),
      Supported: t("levelSupported"),
      Standard: t("levelStandard"),
      SUPPORTED: t("levelSupported"),
      STANDARD: t("levelStandard"),
      LOW_VERBAL: t("levelLowVerbal"),
      NON_VERBAL: t("levelNonVerbal"),
      PRE_SYMBOLIC: t("levelPreSymbolic"),
    };
    return labels[level] ?? level;
  };

  const avgMastery =
    brain && brain.subjects.length > 0
      ? Math.round(
          brain.subjects.reduce((s, x) => s + x.masteryPct, 0) /
            brain.subjects.length,
        )
      : 0;

  const totalSessions = brain?.recentSessions?.length ?? 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !brain) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-3xl bg-[#FFE0E0] border border-[#FECACA] text-[#991B1B]">
          {error}
        </div>
      </div>
    );
  }

  if (!brain) return null;

  const quickLinks = [
    {
      href: `/teacher/learners/${learnerId}/brain`,
      label: t("brainProfileLink"),
      icon: <Brain size={20} />,
      gradient: "linear-gradient(135deg, #7C3AED, #A855F7)",
      description: t("brainProfileLinkDesc"),
    },
    {
      href: `/teacher/learners/${learnerId}/accommodations`,
      label: t("accommodationsLink"),
      icon: <ShieldCheck size={20} />,
      gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
      description: t("accommodationsLinkDesc"),
    },
    {
      href: `/teacher/learners/${learnerId}/iep`,
      label: t("iepGoalsLink"),
      icon: <Target size={20} />,
      gradient: "linear-gradient(135deg, #3B82F6, #2563EB)",
      description: t("iepGoalsLinkDesc"),
    },
    {
      href: `/teacher/learners/${learnerId}/gradebook`,
      label: t("gradebookLink"),
      icon: <GraduationCap size={20} />,
      gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)",
      description: t("gradebookLinkDesc"),
    },
    {
      href: `/teacher/learners/${learnerId}/sessions`,
      label: t("sessionsLink"),
      icon: <Clock size={20} />,
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
      description: t("sessionsLinkDesc"),
    },
    {
      href: `/teacher/learners/${learnerId}/family`,
      label: t("familyLink"),
      icon: <Users size={20} />,
      gradient: "linear-gradient(135deg, #F472B6, #EC4899)",
      description: t("familyLinkDesc"),
    },
  ];

  return (
    <PageWrapper>
      <BackLink href="/teacher">{t("backToClassrooms")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold">
            {brain.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{brain.name}</h1>
            <p className="text-white/80 text-sm">
              {levelLabel(brain.functioningLevel)}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {t("learnerHubSubtitle")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={<TrendingUp size={18} />}
          label={t("avgMasteryLabel")}
          value={`${avgMastery}%`}
          color="#7C3AED"
          delay={100}
        />
        <StatCard
          icon={<BookOpen size={18} />}
          label={t("recentSessionsLabel")}
          value={totalSessions}
          color="#3B82F6"
          delay={200}
        />
        <StatCard
          icon={<ShieldCheck size={18} />}
          label={t("accommodationsLabel")}
          value={brain.accommodations.length}
          color="#10B981"
          delay={300}
        />
        <StatCard
          icon={<Target size={18} />}
          label={t("iepGoalsLabel")}
          value={brain.iepGoals.length}
          color="#F59E0B"
          delay={400}
        />
      </div>

      <ExpandableCard
        icon={<Brain size={16} />}
        title={t("quickNavigationTitle")}
        subtitle={t("quickNavigationSubtitle")}
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={500}
        infoText={t("quickNavigationInfo")}
      >
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className="rounded-3xl p-5 text-center transition-all cursor-pointer hover:scale-[1.03] h-full"
                style={{
                  backgroundColor: "var(--aivo-bg-card)",
                  border: "1px solid var(--aivo-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white"
                  style={{ background: link.gradient }}
                >
                  {link.icon}
                </div>
                <span
                  className="text-sm font-bold block"
                  style={{ color: "var(--aivo-text)" }}
                >
                  {link.label}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--aivo-text-muted)" }}
                >
                  {link.description}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </ExpandableCard>

      {brain.subjects.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<GraduationCap size={16} />}
            title={t("subjectMasteryTitle")}
            subtitle={t("subjectMasterySubtitle")}
            gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
            delay={600}
            infoText={t("subjectMasteryInfo")}
            linkHref={`/teacher/learners/${learnerId}/gradebook`}
            linkLabel={t("viewFullGradebook")}
          >
            <div className="space-y-4">
              {brain.subjects.map((subject) => (
                <div key={subject.subject}>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--aivo-text)" }}
                    >
                      {subject.subject}
                    </span>
                    <span className="text-sm font-semibold text-[#7C3AED]">
                      {Math.round(subject.masteryPct)}%
                    </span>
                  </div>
                  <div
                    className="w-full h-2.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--aivo-purple-50)" }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full transition-all duration-700"
                      style={{ width: `${subject.masteryPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      )}

      <div className="mt-6">
        <ExpandableCard
          icon={<Send size={16} />}
          title={t("submitInsightTitle")}
          subtitle={t("submitInsightSubtitle")}
          gradient="linear-gradient(135deg, #F59E0B, #D97706)"
          delay={700}
          infoText={t("submitInsightInfo")}
        >
          <textarea
            value={insightText}
            onChange={(e) => setInsightText(e.target.value)}
            placeholder={t("insightPlaceholder")}
            rows={3}
            className="w-full rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            {insightSuccess && (
              <span className="text-sm text-green-600 font-medium">
                {t("insightSubmittedMsg")}
              </span>
            )}
            {!insightSuccess && <span />}
            <Button
              size="sm"
              loading={submittingInsight}
              disabled={!insightText.trim()}
              leftIcon={<Send size={14} />}
              onClick={handleSubmitInsight}
            >
              {t("submit")}
            </Button>
          </div>
        </ExpandableCard>
      </div>

      <div className="mt-6">
        <ExpandableCard
          icon={<Upload size={16} />}
          title={t("quickUploadIepTitle")}
          subtitle={t("quickUploadIepSubtitle")}
          gradient="linear-gradient(135deg, #6B7280, #4B5563)"
          delay={800}
          infoText={t("quickUploadIepInfo")}
        >
          <div className="flex items-center gap-4">
            <input
              ref={iepFileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleIepUpload}
              className="hidden"
              id="iep-upload"
            />
            <Button
              variant="outline"
              size="sm"
              loading={uploadingIep}
              leftIcon={<Upload size={14} />}
              onClick={() => iepFileRef.current?.click()}
            >
              {t("chooseFile")}
            </Button>
            {iepSuccess && (
              <span className="text-sm text-green-600 font-medium">
                {t("iepUploadedSuccess")}
              </span>
            )}
          </div>
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}
