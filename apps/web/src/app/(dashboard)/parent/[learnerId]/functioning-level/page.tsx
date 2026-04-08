"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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

const TRIGGER_LABELS: Record<string, string> = {
  assessment: "Initial assessment",
  parent_questionnaire: "Parent questionnaire",
  manual: "Manual update",
  baseline_assessment: "Baseline assessment",
  ai_recommendation: "AI recommendation",
};

function formatTrigger(trigger: string): string {
  return TRIGGER_LABELS[trigger] ?? trigger;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FunctioningLevelPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["functioning-level", learnerId],
    queryFn: () =>
      apiFetch<FunctioningLevelData>(
        API_ROUTES.FUNCTIONING_LEVEL.CURRENT(learnerId),
      ),
    enabled: !!learnerId,
  });

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-gray-500 dark:text-gray-400">
          Loading functioning level…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <Brain className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-red-500 mb-4">
          {error instanceof Error ? error.message : "Failed to load functioning level."}
        </p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          leftIcon={<RefreshCw size={16} />}
        >
          Retry
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
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to Brain Profile
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Brain size={32} />
          <div>
            <h1 className="text-2xl font-bold">Functioning Level</h1>
            <p className="text-white/80 text-sm">
              How your child's learning environment is adapted
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="space-y-4">
        {/* Current level */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Current Level
            </h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className={`text-sm px-4 py-1.5 ${meta.badgeClass}`}>
                {meta.label}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {meta.description}
            </p>
          </CardBody>
        </Card>

        {/* Active adaptations */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Active Adaptations
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {meta.adaptations.map((a) => (
                <li key={a.text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Level History
              </h3>
            </CardHeader>
            <CardBody>
              <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-4 ml-2">
                {data.history.map((entry, i) => {
                  const entryMeta = LEVEL_META[entry.level] ?? LEVEL_META.STANDARD;
                  return (
                    <li key={i} className="ml-4">
                      <div className="absolute w-3 h-3 rounded-full -left-1.5 border border-white dark:border-gray-900 bg-[#7C3AED]" />
                      <time className="mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">
                        {new Date(entry.setAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-xs px-2 py-0.5 ${entryMeta.badgeClass}`}>
                          {entryMeta.label}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          via {formatTrigger(entry.trigger)}
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
