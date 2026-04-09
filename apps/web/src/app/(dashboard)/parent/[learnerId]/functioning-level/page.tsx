"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Brain, Loader2, RefreshCw, Shield, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

type Level = "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";

interface HistoryEntry { level: Level; setAt: string; trigger: string; }
interface FunctioningLevelData { current: Level; history: HistoryEntry[]; }

const LEVEL_META: Record<Level, { label: string; description: string; badgeClass: string; color: string; adaptations: { icon: string; text: string }[] }> = {
  STANDARD: {
    label: "Standard", description: "Grade-level curriculum with standard expectations and regular progress checks.",
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", color: "#10B981",
    adaptations: [{ icon: "\u{1F4DA}", text: "Full grade-level text complexity" }, { icon: "\u{1F3AF}", text: "Up to 4 answer choices" }, { icon: "\u{1F50A}", text: "Audio cues available" }],
  },
  SUPPORTED: {
    label: "Supported", description: "Moderate support with visual scaffolding, simplified language, and regular check-ins.",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", color: "#3B82F6",
    adaptations: [{ icon: "\u{1F524}", text: "Simplified language" }, { icon: "\u{1F5BC}\u{FE0F}", text: "Visual scaffolding enabled" }, { icon: "\u{1F3AF}", text: "Up to 4 answer choices" }, { icon: "\u{1F50A}", text: "Audio cues available" }],
  },
  LOW_VERBAL: {
    label: "Low Verbal", description: "Picture-based support with minimal text, audio narration, and up to 3 choices.",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", color: "#F59E0B",
    adaptations: [{ icon: "\u{1F5BC}\u{FE0F}", text: "Picture-based support" }, { icon: "\u{1F3AF}", text: "Up to 3 answer choices" }, { icon: "\u{1F50A}", text: "Audio narration required" }],
  },
  NON_VERBAL: {
    label: "Non-Verbal", description: "Symbol-based communication with partner support and up to 2 choices.",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", color: "#FB923C",
    adaptations: [{ icon: "\u{1F523}", text: "Symbol-based communication" }, { icon: "\u{1F91D}", text: "Communication partner support" }, { icon: "\u{1F3AF}", text: "Up to 2 answer choices" }, { icon: "\u{1F50A}", text: "Audio narration required" }],
  },
  PRE_SYMBOLIC: {
    label: "Pre-Symbolic", description: "Sensory-only engagement; adult-directed sessions with full partner assistance.",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", color: "#EF4444",
    adaptations: [{ icon: "\u{1F31F}", text: "Sensory-only content" }, { icon: "\u{1F469}\u{200D}\u{1F3EB}", text: "Adult-directed sessions" }, { icon: "\u{1F50A}", text: "Audio narration required" }],
  },
};

export default function FunctioningLevelPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const t = useTranslations("brain");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["functioning-level", learnerId],
    queryFn: () => apiFetch<FunctioningLevelData>(API_ROUTES.FUNCTIONING_LEVEL.CURRENT(learnerId)),
    enabled: !!learnerId,
  });

  const levelLabel = (level: Level) => {
    const labels: Record<Level, string> = { STANDARD: t("standardLabel"), SUPPORTED: t("supportedLabel"), LOW_VERBAL: t("lowVerbalLabel"), NON_VERBAL: t("nonVerbalLabel"), PRE_SYMBOLIC: t("preSymbolicLabel") };
    return labels[level] ?? level;
  };

  const triggerLabel = (trigger: string) => {
    const labels: Record<string, string> = { assessment: t("triggerAssessment"), parent_questionnaire: t("triggerParentQuestionnaire"), manual: t("triggerManual"), baseline_assessment: t("triggerBaseline"), ai_recommendation: t("triggerAiRecommendation") };
    return labels[trigger] ?? trigger;
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p style={{ color: "var(--aivo-text-secondary)" }}>{t("loadingFunctioningLevel")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <Brain className="mx-auto mb-4" size={48} style={{ color: "var(--aivo-text-muted)" }} />
        <p className="text-red-500 mb-4">{error instanceof Error ? error.message : t("failedToLoadFunctioningLevel")}</p>
        <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw size={16} />}>{t("retry")}</Button>
      </div>
    );
  }

  const current = data.current ?? "STANDARD";
  const meta = LEVEL_META[current] ?? LEVEL_META.STANDARD;

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}/brain`}>{t("backToBrainProfile")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("functioningLevel")}</h1>
            <p className="text-white/80 text-sm">How AIVO adapts its teaching approach to match your child&apos;s needs</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 mb-8">
        <StatCard icon={<Brain size={18} />} label={t("currentLevel")} value={levelLabel(current)} color={meta.color} delay={100} />
        <StatCard icon={<Clock size={18} />} label="History" value={`${data.history?.length ?? 0} changes`} color="#7C3AED" delay={200} />
      </div>

      <ExpandableCard
        icon={<Brain size={16} />}
        title={t("currentLevel")}
        subtitle="Your child's current support tier and what it means"
        gradient={`linear-gradient(135deg, ${meta.color}, ${meta.color}CC)`}
        delay={300}
        infoText="The functioning level determines how AIVO presents content to your child. Higher support levels use more visual aids, simpler language, and fewer choices. AIVO automatically suggests level changes based on your child's progress."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-4 py-1.5 ${meta.badgeClass}`}>{levelLabel(current)}</Badge>
          </div>
          <p className="leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{meta.description}</p>
        </div>
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard
          icon={<Shield size={16} />}
          title={t("activeAdaptations")}
          subtitle="How lessons are customized for your child right now"
          gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
          delay={400}
          infoText="These are the specific adjustments AIVO makes during lessons. They ensure your child can access learning content in a way that works best for them."
        >
          <ul className="space-y-3">
            {meta.adaptations.map((a) => (
              <li key={a.text} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <span className="text-lg">{a.icon}</span>
                <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{a.text}</span>
              </li>
            ))}
          </ul>
        </ExpandableCard>
      </div>

      {data.history && data.history.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Clock size={16} />}
            title={t("levelHistory")}
            subtitle="How your child's support level has changed over time"
            gradient="linear-gradient(135deg, #8B5CF6, #6D28D9)"
            delay={500}
            defaultExpanded={false}
            infoText="This timeline shows when and why your child's functioning level was changed. Changes can happen through assessments, AI recommendations, or manual adjustments by your care team."
          >
            <ol className="relative border-l-2 space-y-4 ml-2" style={{ borderColor: "var(--aivo-border)" }}>
              {data.history.map((entry, i) => {
                const entryMeta = LEVEL_META[entry.level] ?? LEVEL_META.STANDARD;
                return (
                  <li key={i} className="ml-4">
                    <div className="absolute w-3 h-3 rounded-full -left-[7px] border-2 border-white dark:border-[#2A1E45]" style={{ backgroundColor: entryMeta.color }} />
                    <time className="mb-1 text-xs font-normal leading-none" style={{ color: "var(--aivo-text-muted)" }}>
                      {new Date(entry.setAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </time>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-xs px-2 py-0.5 ${entryMeta.badgeClass}`}>{levelLabel(entry.level)}</Badge>
                      <span className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{t("via", { trigger: triggerLabel(entry.trigger) })}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </ExpandableCard>
        </div>
      )}
    </PageWrapper>
  );
}
