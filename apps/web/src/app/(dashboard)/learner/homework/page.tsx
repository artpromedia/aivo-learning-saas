"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Upload,
  Loader2,
  Clock,
  ChevronRight,
  FileText,
  Lock,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";

interface HomeworkAssignment {
  id: string;
  subject: string;
  status: string;
  homeworkMode: string;
  createdAt: string;
  adaptedProblems: unknown[];
  extractedText?: string;
}

interface UploadResponse {
  assignment?: HomeworkAssignment;
  locked?: boolean;
  requiredSku?: string;
}

export default function HomeworkPage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lockedInfo, setLockedInfo] = useState<{
    locked: boolean;
    requiredSku: string;
  } | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchAssignments() {
      try {
        const data = await apiFetch<{ assignments: HomeworkAssignment[] }>(
          `/api/tutors/homework/learner/${activeLearner!.id}`,
        );
        setAssignments(data.assignments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load homework",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [activeLearner]);

  const handleUpload = async (file: File) => {
    if (!activeLearner?.id) return;
    setUploading(true);
    setError(null);
    setLockedInfo(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("learnerId", activeLearner.id);

      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${apiBase}/api/tutors/homework/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data: UploadResponse = await res.json();

      if (data.locked) {
        setLockedInfo({
          locked: true,
          requiredSku: data.requiredSku ?? "",
        });
        return;
      }

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      if (data.assignment) {
        setAssignments((prev) => [data.assignment!, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  };

  const activeAssignments = assignments.filter(
    (a) => a.status === "READY" || a.status === "IN_PROGRESS",
  );
  const completedAssignments = assignments.filter(
    (a) => a.status === "COMPLETED",
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <Skeleton height={180} className="w-full rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={80} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <BookOpen size={32} />
          <div>
            <h1 className="text-2xl font-bold">{t("homework")}</h1>
            <p className="text-white/80 text-sm">
              {t("homeworkSubtitle")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Locked State */}
      {lockedInfo && (
        <Card className="mb-6 border-2 border-amber-300 dark:border-amber-600">
          <CardBody className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Lock className="text-amber-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Tutor Subscription Required
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This subject requires an active tutor subscription. Subscribe to
                unlock homework help for this subject.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Required: {lockedInfo.requiredSku?.replace("ADDON_TUTOR_", "").replace("_", " ")}
              </p>
            </div>
            <Link href="/learner/tutors">
              <Button size="sm" leftIcon={<Sparkles size={16} />}>
                Subscribe
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Upload Zone */}
      <Card className="mb-8">
        <CardBody>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-[#7C3AED] bg-[#7C3AED]/5"
                : "border-gray-300 dark:border-gray-600 hover:border-[#7C3AED] hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2
                  className="text-[#7C3AED] animate-spin mb-3"
                  size={32}
                />
                <p className="text-sm text-gray-500">
                  Processing homework...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Extracting text, detecting subject, and adapting problems
                </p>
              </div>
            ) : (
              <>
                <Upload
                  className={`mx-auto mb-3 ${isDragging ? "text-[#7C3AED]" : "text-gray-400"}`}
                  size={36}
                />
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("dragDropHomework")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("clickToBrowse")}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Active Assignments */}
      {activeAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            In Progress ({activeAssignments.length})
          </h2>
          <div className="space-y-3">
            {activeAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/learner/homework/${assignment.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                      <FileText className="text-[#7C3AED]" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {assignment.subject.charAt(0).toUpperCase() +
                          assignment.subject.slice(1)}{" "}
                        Homework
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary">
                          {assignment.subject}
                        </Badge>
                        <Badge variant="outline">
                          {assignment.homeworkMode}
                        </Badge>
                        <span>
                          {(assignment.adaptedProblems as unknown[])?.length ??
                            0}{" "}
                          problems
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "IN_PROGRESS"
                          ? "warning"
                          : "default"
                      }
                    >
                      {assignment.status === "IN_PROGRESS"
                        ? "Active"
                        : "Ready"}
                    </Badge>
                    <ChevronRight
                      className="text-gray-400 group-hover:text-[#7C3AED] transition-colors shrink-0"
                      size={18}
                    />
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed ({completedAssignments.length})
          </h2>
          <div className="space-y-3">
            {completedAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/learner/homework/${assignment.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <FileText className="text-gray-400" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {assignment.subject.charAt(0).toUpperCase() +
                          assignment.subject.slice(1)}{" "}
                        Homework
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary">
                          {assignment.subject}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(
                            assignment.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge variant="success">Done</Badge>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && !lockedInfo && (
        <Card>
          <CardBody className="text-center py-12">
            <BookOpen className="mx-auto mb-3 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("noActiveHomework")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("uploadFirstHomework")}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
