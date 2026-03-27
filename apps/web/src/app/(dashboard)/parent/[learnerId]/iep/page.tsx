"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Upload,
  Loader2,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";

interface IepGoal {
  id: string;
  area: string;
  description: string;
  targetDate: string;
  progress: number;
  status: "on_track" | "at_risk" | "met";
}

interface IepDocument {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: number;
}

interface IepData {
  goals: IepGoal[];
  documents: IepDocument[];
  accommodations: string[];
  nextReviewDate: string | null;
}

export default function IepPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<IepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIep() {
      try {
        const result = await apiFetch<IepData>(
          `/api/learners/${learnerId}/iep`,
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load IEP data");
      } finally {
        setLoading(false);
      }
    }

    fetchIep();
  }, [learnerId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/learners/${learnerId}/iep/documents`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );
      // Refresh data
      const result = await apiFetch<IepData>(
        `/api/learners/${learnerId}/iep`,
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      await apiFetch(`/api/learners/${learnerId}/iep/documents/${docId}`, {
        method: "DELETE",
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents.filter((d) => d.id !== docId),
            }
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    on_track: "success",
    at_risk: "warning",
    met: "default",
  };

  const statusLabels: Record<string, string> = {
    on_track: "On Track",
    at_risk: "At Risk",
    met: "Met",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          Retry
        </Button>
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
          <FileText size={32} />
          <div>
            <h1 className="text-2xl font-bold">IEP Goals & Documents</h1>
            <p className="text-white/80 text-sm">
              Track IEP goal progress and manage documents.
              {data?.nextReviewDate && (
                <span>
                  {" "}
                  Next review:{" "}
                  {new Date(data.nextReviewDate).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Goals Section */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        IEP Goals
      </h2>

      {data?.goals && data.goals.length > 0 ? (
        <div className="space-y-4 mb-8">
          {data.goals.map((goal) => (
            <Card key={goal.id}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wide">
                        {goal.area}
                      </span>
                      <Badge
                        variant={
                          statusColors[goal.status] as
                            | "success"
                            | "warning"
                            | "default"
                        }
                      >
                        {statusLabels[goal.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {goal.description}
                    </p>
                  </div>
                  {goal.status === "met" && (
                    <CheckCircle2
                      className="text-green-500 shrink-0"
                      size={24}
                    />
                  )}
                </div>
                <ProgressBar
                  value={goal.progress}
                  max={100}
                  size="sm"
                  showLabel
                />
                <p className="text-xs text-gray-400 mt-2">
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardBody className="text-center py-8">
            <FileText className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="text-gray-500 dark:text-gray-400">
              No IEP goals found. Upload an IEP document to automatically
              extract goals.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Accommodations */}
      {data?.accommodations && data.accommodations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Accommodations
          </h2>
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {data.accommodations.map((acc, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm bg-[#7C3AED]/10 text-[#7C3AED] font-medium"
                  >
                    {acc}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Documents Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Documents
        </h2>
        <Button
          size="sm"
          leftIcon={<Upload size={16} />}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Document
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
      </div>

      {data?.documents && data.documents.length > 0 ? (
        <div className="space-y-3">
          {data.documents.map((doc) => (
            <Card key={doc.id}>
              <CardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                  <FileText className="text-[#7C3AED]" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}{" "}
                    &middot; {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg text-gray-400 hover:text-[#7C3AED] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-8">
            <Upload className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="text-gray-500 dark:text-gray-400">
              No documents uploaded yet.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
