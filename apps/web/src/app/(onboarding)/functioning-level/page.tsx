"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface FunctioningLevelResult {
  level: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  label: string;
  description: string;
  assessmentType: "STANDARD" | "PICTURE_BASED";
  recommendations: string[];
}

const levelColors: Record<string, string> = {
  STANDARD: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  SUPPORTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  LOW_VERBAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  NON_VERBAL: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  PRE_SYMBOLIC: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function FunctioningLevelPage() {
  const router = useRouter();
  const activeLearner = useLearnerStore((s) => s.activeLearner);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<FunctioningLevelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(5);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchLevel() {
      try {
        const data = await apiFetch<FunctioningLevelResult>(
          API_ROUTES.FUNCTIONING_LEVEL.CURRENT(activeLearner!.id),
        );
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to determine functioning level");
      } finally {
        setLoading(false);
      }
    }

    fetchLevel();
  }, [activeLearner]);

  useEffect(() => {
    if (!result) return;

    const interval = setInterval(() => {
      setAutoRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/baseline-assessment");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [result, router]);

  const handleContinue = () => {
    router.push("/baseline-assessment");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton width={64} height={64} rounded="full" className="mx-auto mb-4" />
          <Skeleton height={28} width={260} className="mx-auto mb-2" />
          <Skeleton height={16} width={320} className="mx-auto" />
        </div>
        <Card>
          <CardBody>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-[#7C3AED] animate-spin mr-3" size={32} />
              <p className="text-gray-500 dark:text-gray-400">
                Determining functioning level...
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <Brain className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Unable to determine functioning level
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <Brain className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Functioning Level Determined
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Based on the information provided, we&apos;ve identified the best learning approach for{" "}
          {activeLearner?.name ?? "your child"}.
        </p>
      </div>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardBody className="text-center py-8">
              <Badge
                className={`text-sm px-4 py-1.5 mb-4 ${levelColors[result.level] ?? ""}`}
              >
                {result.label}
              </Badge>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto">
                {result.description}
              </p>
            </CardBody>
          </Card>

          {result.recommendations.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  What This Means
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Assessment type:{" "}
                <span className="font-medium text-[#7C3AED]">
                  {result.assessmentType === "STANDARD"
                    ? "Standard Multiple Choice"
                    : "Picture-Based Interactive"}
                </span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Auto-redirecting to baseline assessment in {autoRedirectCountdown}s...
              </p>
              <Button onClick={handleContinue} rightIcon={<ArrowRight size={18} />}>
                Continue to Assessment
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
