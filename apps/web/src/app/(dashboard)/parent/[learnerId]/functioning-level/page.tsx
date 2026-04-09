"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, Brain, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

// ─── Types ───────────────────────────────────────────────────────────────────

type Level = "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";

interface HistoryEntry {
  level: Level;
  setAt: string;
  trigger: string;
}

interface FunctioningLevelData {
  current: Level;
  history: HistoryEntry[];
}

// ─── Level metadata ───────────────────────────────────────────────────────────

const LEVEL_META: Record<
  Level,
  {
    label: string;
    description: string;
    badgeClass: string;
    adaptations: { icon: string; text: string }[];
  }
> = {
  STANDARD: {
    label: "Standard",
    description:
      "Grade-level curriculum with standard expectations and regular progress checks.",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    adaptations: [
      { icon: "📚", text: "Full grade-level text complexity" },
      { icon: "🎯", text: "Up to 4 answer choices" },
      { icon: "🔊", text: "Audio cues available" },
    ],
  },
  SUPPORTED: {
    label: "Supported",
    description:
      "Moderate support with visual scaffolding, simplified language, and regular check-ins.",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    adaptations: [
      { icon: "🔤", text: "Simplified language" },
      { icon: "🖼️", text: "Visual scaffolding enabled" },
      { icon: "🎯", text: "Up to 4 answer choices" },
      { icon: "🔊", text: "Audio cues available" },
    ],
  },
  LOW_VERBAL: {
    label: "Low Verbal",
    description:
      "Picture-based support with minimal text, audio narration, and up to 3 choices.",
    badgeClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    adaptations: [
      { icon: "🖼️", text: "Picture-based support" },
      { icon: "🎯", text: "Up to 3 answer choices" },
      { icon: "🔊", text: "Audio narration required" },
    ],
  },
  NON_VERBAL: {
    label: "Non-Verbal",
    description:
      "Symbol-based communication with partner support and up to 2 choices.",
    badgeClass:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    adaptations: [
      { icon: "🔣", text: "Symbol-based communication" },
      { icon: "🤝", text: "Communication partner support" },
      { icon: "🎯", text: "Up to 2 answer choices" },
      { icon: "🔊", text: "Audio narration required" },
    ],
  },
  PRE_SYMBOLIC: {
    label: "Pre-Symbolic",
    description:
      "Sensory-only engagement; adult-directed sessions with full partner assistance.",
    badgeClass:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    adaptations: [
      { icon: "🌟", text: "Sensory-only content" },
      { icon: "👩‍🏫", text: "Adult-directed sessions" },
      { icon: "🔊", text: "Audio narration required" },
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function FunctioningLevelPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const t = useTranslations("brain");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["functioning-level", learnerId],
    queryFn: () =>
      apiFetch<FunctioningLevelData>(
        API_ROUTES.FUNCTIONING_LEVEL.CURRENT(learnerId),
      ),
    enabled: !!learnerId,
  });

  const levelLabel = (level: Level) => {
    const labels: Record<Level, string> = {
      STANDARD: t("standardLabel"),
      SUPPORTED: t("supportedLabel"),
      LOW_VERBAL: t("lowVerbalLabel"),
      NON_VERBAL: t("nonVerbalLabel"),
      PRE_SYMBOLIC: t("preSymbolicLabel"),
    };
    return labels[level] ?? level;
  };

  const triggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      assessment: t("triggerAssessment"),
      parent_questionnaire: t("triggerParentQuestionnaire"),
      manual: t("triggerManual"),
      baseline_assessment: t("triggerBaseline"),
      ai_recommendation: t("triggerAiRecommendation"),
    };
    return labels[trigger] ?? trigger;
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-[var(--aivo-text-secondary)]">
          {t("loadingFunctioningLevel")}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <Brain className="mx-auto mb-4 text-[#A89BB5]" size={48} />
        <p className="text-red-500 mb-4">
          {error instanceof Error ? error.message : t("failedToLoadFunctioningLevel")}
        </p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          leftIcon={<RefreshCw size={16} />}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  const current = data.current ?? "STANDARD";
  const meta = LEVEL_META[current] ?? LEVEL_META.STANDARD;

  return (
    <div>
      <Link
        href={`/parent/${learnerId}/brain`}
        className="inline-flex items-center gap-1 text-sm text-[var(--aivo-text-secondary)] hover:text-[var(--aivo-text)] dark:text-[var(--aivo-text-muted)] dark:hover:text-[#A89BB5] mb-4"
      >
        <ArrowLeft size={16} />
        {t("backToBrainProfile")}
      </Link>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <Brain size={32} />
          <div>
            <h1 className="text-2xl font-extrabold">{t("functioningLevel")}</h1>
            <p className="text-white/80 text-sm">
              {t("functioningLevelSubtitle")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="space-y-4">
        {/* Current level */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[var(--aivo-text)]">
              {t("currentLevel")}
            </h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className={`text-sm px-4 py-1.5 ${meta.badgeClass}`}>
                {levelLabel(current)}
              </Badge>
            </div>
            <p className="text-[var(--aivo-text-secondary)] dark:text-[#A89BB5] leading-relaxed">
              {meta.description}
            </p>
          </CardBody>
        </Card>

        {/* Active adaptations */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[var(--aivo-text)]">
              {t("activeAdaptations")}
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {meta.adaptations.map((a) => (
                <li key={a.text} className="flex items-center gap-2 text-sm text-[var(--aivo-text-secondary)]">
                  <span>{a.icon}</span>
                  {a.text}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* History */}
        {data.history && data.history.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[var(--aivo-text)]">
                {t("levelHistory")}
              </h3>
            </CardHeader>
            <CardBody>
              <ol className="relative border-l border-[#E8DDF0] dark:border-[#3D2D5C] space-y-4 ml-2">
                {data.history.map((entry, i) => {
                  const entryMeta = LEVEL_META[entry.level] ?? LEVEL_META.STANDARD;
                  return (
                    <li key={i} className="ml-4">
                      <div className="absolute w-3 h-3 rounded-full -left-1.5 border border-white dark:border-[#2A1E45] bg-[#7C3AED]" />
                      <time className="mb-1 text-xs font-normal leading-none text-[var(--aivo-text-muted)]">
                        {new Date(entry.setAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-xs px-2 py-0.5 ${entryMeta.badgeClass}`}>
                          {levelLabel(entry.level)}
                        </Badge>
                        <span className="text-xs text-[var(--aivo-text-secondary)]">
                          {t("via", { trigger: triggerLabel(entry.trigger) })}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
