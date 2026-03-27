"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Upload,
  Loader2,
  RefreshCw,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";

interface HomeworkSession {
  id: string;
  title: string;
  subject: string;
  status: "active" | "completed";
  createdAt: string;
  questionsAnswered: number;
  uploadedFileName?: string;
}

export default function HomeworkPage() {
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessions, setSessions] = useState<HomeworkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchSessions() {
      try {
        const data = await apiFetch<HomeworkSession[]>(
          `/api/learners/${activeLearner!.id}/homework`,
        );
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load homework");
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [activeLearner]);

  const handleUpload = async (file: File) => {
    if (!activeLearner?.id) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/learners/${activeLearner.id}/homework/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      const newSession = await res.json();
      setSessions((prev) => [newSession, ...prev]);
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

  const activeSessions = sessions.filter((s) => s.status === "active");
  const completedSessions = sessions.filter((s) => s.status === "completed");

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
            <h1 className="text-2xl font-bold">Homework Helper</h1>
            <p className="text-white/80 text-sm">
              Upload homework and get step-by-step AI assistance.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
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
                <Loader2 className="text-[#7C3AED] animate-spin mb-3" size={32} />
                <p className="text-sm text-gray-500">Uploading homework...</p>
              </div>
            ) : (
              <>
                <Upload
                  className={`mx-auto mb-3 ${isDragging ? "text-[#7C3AED]" : "text-gray-400"}`}
                  size={36}
                />
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload your homework
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop or click to browse. Supports PDF and images.
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

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            In Progress ({activeSessions.length})
          </h2>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <Link key={session.id} href={`/learner/homework/${session.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                      <FileText className="text-[#7C3AED]" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary">{session.subject}</Badge>
                        <span>{session.questionsAnswered} questions helped</span>
                      </div>
                    </div>
                    <Badge variant="warning">Active</Badge>
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

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed ({completedSessions.length})
          </h2>
          <div className="space-y-3">
            {completedSessions.map((session) => (
              <Link key={session.id} href={`/learner/homework/${session.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <FileText className="text-gray-400" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary">{session.subject}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(session.createdAt).toLocaleDateString()}
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

      {sessions.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <BookOpen className="mx-auto mb-3 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No homework sessions yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Upload your homework above to start getting AI-powered help.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
