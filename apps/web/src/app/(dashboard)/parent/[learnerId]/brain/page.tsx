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

export default function BrainProfilePage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const { profile, isLoading, error } = useBrain(learnerId);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-gray-500 dark:text-gray-400">Loading brain profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>
          Retry
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <Brain className="mx-auto mb-4 text-gray-400" size={48} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No brain profile yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Complete the onboarding assessment to generate a brain profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Brain size={32} />
          <div>
            <h1 className="text-2xl font-bold">Brain Profile</h1>
            <p className="text-white/80 text-sm">
              AI-generated learning profile &middot; Status:{" "}
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
                Overview
              </h3>
              <Badge>
                {profile.functioningLevel === "STANDARD"
                  ? "Standard"
                  : profile.functioningLevel === "SUPPORTED"
                    ? "Supported"
                    : profile.functioningLevel === "LOW_VERBAL"
                      ? "Low Verbal"
                      : profile.functioningLevel === "NON_VERBAL"
                        ? "Non-Verbal"
                        : "Pre-Symbolic"}
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Learning Style
              </span>
              <p className="text-gray-900 dark:text-white">{profile.learningStyle}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Communication Style
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
              Strengths
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
              Growth Areas
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
                Sensory Preferences
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
          Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
