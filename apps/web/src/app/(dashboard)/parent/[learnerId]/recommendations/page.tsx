"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Lightbulb, Check, X, SlidersHorizontal, Loader2, RefreshCw, Info, Clock,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { useTranslations } from "next-intl";
import { useRecommendations, type Recommendation } from "@/hooks/useRecommendations";

const priorityVariant: Record<string, "error" | "warning" | "default"> = {
  high: "error",
  medium: "warning",
  low: "default",
};

const typeIcon: Record<string, string> = {
  curriculum: "\u{1F4DA}",
  tutor: "\u{1F916}",
  accommodation: "\u{1F3AF}",
  activity: "\u{1F3AE}",
};

export default function RecommendationsPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const {
    recommendations, isLoading, error, approve, decline, adjust,
    isApproving, isDeclining, isAdjusting,
  } = useRecommendations(learnerId);

  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [adjustNotes, setAdjustNotes] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (recId: string) => {
    setActionError(null);
    setProcessingId(recId);
    try { await approve(recId); }
    catch (err) { setActionError(err instanceof Error ? err.message : t("failedToApprove")); }
    finally { setProcessingId(null); }
  };

  const handleDecline = async (recId: string) => {
    setActionError(null);
    setProcessingId(recId);
    try { await decline(recId); }
    catch (err) { setActionError(err instanceof Error ? err.message : t("failedToDecline")); }
    finally { setProcessingId(null); }
  };

  const handleAdjust = async () => {
    if (!selectedRec) return;
    setActionError(null);
    try {
      await adjust({ recId: selectedRec.id, adjustments: { notes: adjustNotes } });
      setShowAdjustModal(false);
      setAdjustNotes("");
      setSelectedRec(null);
    } catch (err) { setActionError(err instanceof Error ? err.message : t("failedToAdjust")); }
  };

  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const resolvedRecs = recommendations.filter((r) => r.status !== "pending");

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p style={{ color: "var(--aivo-text-secondary)" }}>{t("loadingRecommendations")}</p>
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

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}`}>{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Lightbulb size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("recommendationsTitle")}</h1>
            <p className="text-white/80 text-sm">AIVO&apos;s personalized suggestions to help your child learn better</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 mb-8">
        <StatCard icon={<Clock size={18} />} label="Pending Review" value={pendingRecs.length} color="#F59E0B" delay={100} />
        <StatCard icon={<Check size={18} />} label="Resolved" value={resolvedRecs.length} color="#10B981" delay={200} />
      </div>

      {actionError && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
          {actionError}
        </div>
      )}

      {pendingRecs.length > 0 ? (
        <ExpandableCard
          icon={<Lightbulb size={16} />}
          title={t("pendingReview", { count: pendingRecs.length })}
          subtitle="Review and approve AI suggestions for your child"
          gradient="linear-gradient(135deg, #F59E0B, #D97706)"
          delay={300}
          infoText="AIVO analyzes your child's learning patterns and suggests improvements. You can approve, decline, or adjust each recommendation. Your approval is always required before any changes take effect."
        >
          <div className="space-y-4">
            {pendingRecs.map((rec, idx) => (
              <AnimatedCard key={rec.id} delay={400 + idx * 80}>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{typeIcon[rec.type] ?? "\u{1F4A1}"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{rec.title}</h3>
                        <Badge variant={priorityVariant[rec.priority]}>{t("priority", { level: rec.priority })}</Badge>
                        <Badge variant="secondary">{rec.type}</Badge>
                      </div>
                      <p className="text-sm mb-2" style={{ color: "var(--aivo-text-secondary)" }}>{rec.description}</p>
                      <div className="flex items-start gap-1.5 text-xs p-2.5 rounded-xl" style={{ color: "var(--aivo-text-secondary)", backgroundColor: "var(--aivo-purple-50)" }}>
                        <Info size={14} className="shrink-0 mt-0.5" style={{ color: "#7C3AED" }} />
                        <span>{rec.reasoning}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t" style={{ borderColor: "var(--aivo-border)" }}>
                    <Button variant="ghost" size="sm" onClick={() => handleDecline(rec.id)} loading={processingId === rec.id && isDeclining} disabled={processingId === rec.id} leftIcon={<X size={16} />}>{t("decline")}</Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedRec(rec); setShowAdjustModal(true); }} leftIcon={<SlidersHorizontal size={16} />}>{t("adjust")}</Button>
                    <Button size="sm" onClick={() => handleApprove(rec.id)} loading={processingId === rec.id && isApproving} disabled={processingId === rec.id} leftIcon={<Check size={16} />}>{t("approve")}</Button>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </ExpandableCard>
      ) : (
        <EmptyState
          icon={<Lightbulb size={32} />}
          title={t("allCaughtUpTitle")}
          description={t("noPendingRecommendations")}
          delay={300}
        />
      )}

      {resolvedRecs.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Check size={16} />}
            title={t("history")}
            subtitle="Previously reviewed recommendations"
            gradient="linear-gradient(135deg, #10B981, #059669)"
            delay={500}
            defaultExpanded={false}
          >
            <div className="space-y-3">
              {resolvedRecs.map((rec) => (
                <div key={rec.id} className="flex items-center gap-3 p-3 rounded-xl opacity-75" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <span className="text-lg">{typeIcon[rec.type] ?? "\u{1F4A1}"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--aivo-text)" }}>{rec.title}</p>
                  </div>
                  <Badge variant={rec.status === "approved" ? "success" : rec.status === "declined" ? "error" : "warning"}>{rec.status}</Badge>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      )}

      <Modal
        open={showAdjustModal}
        onClose={() => { setShowAdjustModal(false); setSelectedRec(null); setAdjustNotes(""); }}
        title={t("adjustRecommendation")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAdjustModal(false)}>{tc("cancel")}</Button>
            <Button onClick={handleAdjust} loading={isAdjusting} disabled={!adjustNotes.trim()}>{t("submitAdjustment")}</Button>
          </div>
        }
      >
        <p className="text-sm mb-4" style={{ color: "var(--aivo-text-secondary)" }}>
          {t("adjustPrompt", { title: selectedRec?.title })}
        </p>
        <textarea
          value={adjustNotes}
          onChange={(e) => setAdjustNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none resize-none"
          placeholder="e.g., 'I'd prefer shorter sessions' or 'Focus more on reading comprehension'"
        />
      </Modal>
    </PageWrapper>
  );
}
