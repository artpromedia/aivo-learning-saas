"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  BookOpen,
  Upload,
  Send,
  Clock,
  Target,
  ShieldCheck,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";

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

export default function LearnerBrainViewPage() {
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
          `/api/teacher/learners/${learnerId}/brain`,
        );
        setBrain(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load learner data",
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
      await apiFetch(`/api/family/insights/${learnerId}`, {
        method: "POST",
        body: JSON.stringify({ text: insightText.trim() }),
      });
      setInsightText("");
      setInsightSuccess(true);
      setTimeout(() => setInsightSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit insight",
      );
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

      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(
        `${API_BASE}/api/teacher/learners/${learnerId}/iep`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Upload failed: ${res.status}`);
      }
      setIepSuccess(true);
      setTimeout(() => setIepSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload IEP");
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

  const levelBadgeVariant = (level: string) => {
    switch (level) {
      case "level1":
        return "warning" as const;
      case "level2":
        return "default" as const;
      case "level3":
        return "success" as const;
      default:
        return "secondary" as const;
    }
  };

  const levelLabel = (level: string) => {
    switch (level) {
      case "level1":
        return "Level 1";
      case "level2":
        return "Level 2";
      case "level3":
        return "Level 3";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton height={120} className="w-full rounded-xl mb-8" />
        <div className="grid gap-6 md:grid-cols-2 px-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody>
                <SkeletonText lines={4} />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !brain) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!brain) return null;

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Classrooms
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
            {brain.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{brain.name}</h1>
            <Badge variant={levelBadgeVariant(brain.functioningLevel)} className="mt-1">
              {levelLabel(brain.functioningLevel)}
            </Badge>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subject Mastery */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain size={18} className="text-[#7C3AED]" />
              Mastery by Subject
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {brain.subjects.length === 0 ? (
              <p className="text-gray-500 text-sm">No subject data yet.</p>
            ) : (
              brain.subjects.map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {s.subject}
                    </span>
                    <span className="text-sm font-semibold text-[#7C3AED]">
                      {Math.round(s.masteryPct)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] transition-all duration-500"
                      style={{ width: `${s.masteryPct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Accommodations */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#7C3AED]" />
              Accommodations
            </h2>
          </CardHeader>
          <CardBody>
            {brain.accommodations.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No accommodations listed.
              </p>
            ) : (
              <ul className="space-y-3">
                {brain.accommodations.map((acc) => (
                  <li
                    key={acc.id}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                    <div>
                      <span className="font-medium">{acc.label}</span>
                      {acc.description && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {acc.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* IEP Goals */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target size={18} className="text-[#7C3AED]" />
              IEP Goals
            </h2>
          </CardHeader>
          <CardBody className="space-y-5">
            {brain.iepGoals.length === 0 ? (
              <p className="text-gray-500 text-sm">No IEP goals on file.</p>
            ) : (
              brain.iepGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {goal.title}
                    </span>
                    {goal.targetDate && (
                      <span className="text-xs text-gray-400">
                        Target: {formatDate(goal.targetDate)}
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    value={goal.progressPct}
                    size="sm"
                    showLabel={false}
                  />
                  <span className="text-xs text-[#7C3AED] font-semibold">
                    {Math.round(goal.progressPct)}%
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-[#7C3AED]" />
              Recent Sessions
            </h2>
          </CardHeader>
          <CardBody>
            {brain.recentSessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No sessions recorded.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {brain.recentSessions.map((session) => (
                  <li
                    key={session.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {session.subject}
                      </span>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{formatDate(session.date)}</span>
                        <span>{session.durationMin} min</span>
                      </div>
                    </div>
                    {session.score != null && (
                      <Badge
                        variant={session.score >= 70 ? "success" : "warning"}
                      >
                        {session.score}%
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Upload IEP */}
      <Card className="mt-6">
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Upload size={16} className="text-[#7C3AED]" />
              Upload IEP
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload a new IEP document. The parent will be asked to review and
              confirm.
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              Choose File
            </Button>
            {iepSuccess && (
              <span className="text-sm text-green-600 font-medium">
                IEP uploaded successfully.
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Submit Insight */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={16} className="text-[#7C3AED]" />
            Submit Insight
          </h3>
        </CardHeader>
        <CardBody>
          <textarea
            value={insightText}
            onChange={(e) => setInsightText(e.target.value)}
            placeholder="Share an observation or insight about this learner..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            {insightSuccess && (
              <span className="text-sm text-green-600 font-medium">
                Insight submitted successfully.
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
              Submit
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
