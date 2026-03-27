"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Lightbulb,
  ArrowLeft,
  Check,
  X,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useRecommendations, type Recommendation } from "@/hooks/useRecommendations";

const priorityVariant: Record<string, "error" | "warning" | "default"> = {
  high: "error",
  medium: "warning",
  low: "default",
};

const typeIcon: Record<string, string> = {
  curriculum: "📚",
  tutor: "🤖",
  accommodation: "🎯",
  activity: "🎮",
};

export default function RecommendationsPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const {
    recommendations,
    isLoading,
    error,
    approve,
    decline,
    adjust,
    isApproving,
    isDeclining,
    isAdjusting,
  } = useRecommendations(learnerId);

  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [adjustNotes, setAdjustNotes] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (recId: string) => {
    setActionError(null);
    setProcessingId(recId);
    try {
      await approve(recId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (recId: string) => {
    setActionError(null);
    setProcessingId(recId);
    try {
      await decline(recId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to decline");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAdjust = async () => {
    if (!selectedRec) return;
    setActionError(null);
    try {
      await adjust({ recId: selectedRec.id, adjustments: { notes: adjustNotes } });
      setShowAdjustModal(false);
      setAdjustNotes("");
      setSelectedRec(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to adjust");
    }
  };

  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const resolvedRecs = recommendations.filter((r) => r.status !== "pending");

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-gray-500 dark:text-gray-400">Loading recommendations...</p>
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
          <Lightbulb size={32} />
          <div>
            <h1 className="text-2xl font-bold">Recommendations</h1>
            <p className="text-white/80 text-sm">
              AI-powered suggestions to optimize your child&apos;s learning path.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {actionError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {pendingRecs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Review ({pendingRecs.length})
          </h2>
          <div className="space-y-4">
            {pendingRecs.map((rec) => (
              <Card key={rec.id}>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">
                      {typeIcon[rec.type] ?? "💡"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </h3>
                        <Badge variant={priorityVariant[rec.priority]}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="secondary">{rec.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <span>{rec.reasoning}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDecline(rec.id)}
                      loading={processingId === rec.id && isDeclining}
                      disabled={processingId === rec.id}
                      leftIcon={<X size={16} />}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRec(rec);
                        setShowAdjustModal(true);
                      }}
                      leftIcon={<SlidersHorizontal size={16} />}
                    >
                      Adjust
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(rec.id)}
                      loading={processingId === rec.id && isApproving}
                      disabled={processingId === rec.id}
                      leftIcon={<Check size={16} />}
                    >
                      Approve
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pendingRecs.length === 0 && (
        <Card className="mb-8">
          <CardBody className="text-center py-12">
            <Lightbulb className="mx-auto mb-3 text-gray-400" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              All caught up!
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No pending recommendations. Check back later for new suggestions.
            </p>
          </CardBody>
        </Card>
      )}

      {resolvedRecs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            History
          </h2>
          <div className="space-y-3">
            {resolvedRecs.map((rec) => (
              <Card key={rec.id} className="opacity-75">
                <CardBody className="flex items-center gap-3">
                  <span className="text-lg">{typeIcon[rec.type] ?? "💡"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {rec.title}
                    </p>
                  </div>
                  <Badge
                    variant={
                      rec.status === "approved"
                        ? "success"
                        : rec.status === "declined"
                          ? "error"
                          : "warning"
                    }
                  >
                    {rec.status}
                  </Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedRec(null);
          setAdjustNotes("");
        }}
        title="Adjust Recommendation"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAdjustModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdjust}
              loading={isAdjusting}
              disabled={!adjustNotes.trim()}
            >
              Submit Adjustment
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Tell us how you&apos;d like to adjust &quot;{selectedRec?.title}&quot;.
        </p>
        <textarea
          value={adjustNotes}
          onChange={(e) => setAdjustNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none resize-none"
          placeholder="e.g., 'I'd prefer shorter sessions' or 'Focus more on reading comprehension'"
        />
      </Modal>
    </div>
  );
}
