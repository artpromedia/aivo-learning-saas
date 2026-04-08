"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Brain, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useBrain } from "@/hooks/useBrain";
import { useTranslations } from "next-intl";

export default function BrainProfilePage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const { profile, isLoading, error } = useBrain(learnerId);
  const t = useTranslations("brain");

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-gray-500 dark:text-gray-400">{t("loadingBrainProfile")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <Brain className="mx-auto mb-4 text-gray-400" size={48} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t("noBrainProfileYet")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {t("noBrainProfileDesc")}
        </p>
        <Link href={`/baseline-assessment?learnerId=${learnerId}`}>
          <Button variant="primary" leftIcon={<Brain size={16} />}>
            {t("startBaselineAssessment")}
          </Button>
        </Link>
      </div>
    );
  }

  const functioningLevelLabel: Record<string, string> = {
    STANDARD: t("standardLabel"),
    SUPPORTED: t("supportedLabel"),
    LOW_VERBAL: t("lowVerbalLabel"),
    NON_VERBAL: t("nonVerbalLabel"),
    PRE_SYMBOLIC: t("preSymbolicLabel"),
  };

  return (
    <div>
      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        {t("backToDashboard")}
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Brain size={32} />
          <div>
            <h1 className="text-2xl font-bold">{t("brainProfile")}</h1>
            <p className="text-white/80 text-sm">
              {t("aiGeneratedProfile")} &middot; {t("statusLabel")}:{" "}
              <span className="capitalize font-medium">{profile.status}</span>
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("overview")}
              </h3>
              <Badge>
                {functioningLevelLabel[profile.functioningLevel] ?? profile.functioningLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("learningStyle")}
              </span>
              <p className="text-gray-900 dark:text-white">{profile.learningStyle}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("communicationStyle")}
              </span>
              <p className="text-gray-900 dark:text-white">
                {profile.communicationStyle}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("strengths")}
            </h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {profile.strengths.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("growthAreas")}
            </h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {profile.challenges.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1.5 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>

        {profile.sensoryPreferences.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("sensoryPreferences")}
              </h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {profile.sensoryPreferences.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1.5 rounded-full text-sm bg-[#7C3AED]/10 text-[#7C3AED] font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
          {t("lastUpdated", { date: new Date(profile.updatedAt).toLocaleDateString() })}
        </div>

        <div className="text-center pt-2">
          <Link
            href={`/parent/${learnerId}/functioning-level`}
            className="inline-flex items-center gap-1 text-sm text-[#7C3AED] hover:underline"
          >
            {t("viewFunctioningLevel")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
