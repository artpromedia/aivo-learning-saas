"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Brain,
  Download,
  BarChart3,
  Users,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useAuthStore } from "@/stores/auth.store";

interface CurrentSubscription {
  id: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: "month" | "year";
    maxLearners: number;
  };
  status: "active" | "trialing" | "past_due" | "canceled";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  learnerCount: number;
}

type PageState = "confirm" | "cancelled" | "reactivated";

export default function CancelSubscriptionPage() {
  const { user } = useAuthStore();
  const t = useTranslations("billing");
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [pageState, setPageState] = useState<PageState>("confirm");

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const result = await apiFetch<CurrentSubscription>(
          API_ROUTES.BILLING.CURRENT_SUBSCRIPTION,
        );
        setSubscription(result);
        if (result.cancelAtPeriodEnd) {
          setPageState("cancelled");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("failedToLoad"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [t]);

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    setError(null);
    try {
      await apiFetch(API_ROUTES.BILLING.CANCEL(subscription.id), {
        method: "POST",
      });
      setPageState("cancelled");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("failedToCancel"),
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;
    setReactivating(true);
    setError(null);
    try {
      await apiFetch(
        API_ROUTES.BILLING.REACTIVATE(subscription.id),
        { method: "POST" },
      );
      setPageState("reactivated");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("failedToReactivate"),
      );
    } finally {
      setReactivating(false);
    }
  };

  const loseFeatures = [
    {
      icon: <Brain size={18} />,
      label: t("featureBrainProfiles"),
      description: t("featureBrainProfilesDesc"),
    },
    {
      icon: <BarChart3 size={18} />,
      label: t("featureAnalytics"),
      description: t("featureAnalyticsDesc"),
    },
    {
      icon: <Users size={18} />,
      label: t("featureCollaborators"),
      description: t("featureCollaboratorsDesc"),
    },
    {
      icon: <Sparkles size={18} />,
      label: t("featureAdaptiveSessions"),
      description: t("featureAdaptiveSessionsDesc"),
    },
  ];

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <Skeleton height={80} className="w-full rounded-2xl" />
        <Skeleton height={200} className="w-full rounded-2xl" />
        <Skeleton height={150} className="w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link
        href="/manage"
        className="inline-flex items-center gap-1 text-sm text-[var(--aivo-text-secondary)] hover:text-[var(--aivo-text)] dark:text-[var(--aivo-text-muted)] dark:hover:text-[#A89BB5] mb-4"
      >
        <ArrowLeft size={16} />
        {t("backToSubscription")}
      </Link>

      {/* Cancelled Success State */}
      {pageState === "cancelled" && subscription && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#FEF3C7] dark:bg-[#92400E]/30 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-[#D97706] dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--aivo-text)] mb-2">
              {t("subscriptionCancelled")}
            </h1>
            <p className="text-[var(--aivo-text-secondary)] max-w-md mx-auto">
              {t("cancelledGraceInfo", { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() })}
            </p>
          </div>

          <Card>
            <CardBody className="text-center py-6">
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
                {t("reactivateGraceInfo")}
              </p>
              <Button
                onClick={handleReactivate}
                loading={reactivating}
                leftIcon={<RefreshCw size={16} />}
              >
                {t("resubscribe")}
              </Button>
            </CardBody>
          </Card>

          {error && (
            <div className="p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
              {error}
            </div>
          )}

          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-3">
                <Download size={18} className="text-[#7C3AED]" />
                <h3 className="font-semibold text-[var(--aivo-text)]">
                  {t("exportYourData")}
                </h3>
              </div>
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
                {t("exportDataDesc")}
              </p>
              <Link href="/parent">
                <Button variant="outline" leftIcon={<Download size={16} />}>
                  {t("goToLearnerSettings")}
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Reactivated Success State */}
      {pageState === "reactivated" && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle
              size={32}
              className="text-green-600 dark:text-green-400"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--aivo-text)] mb-2">
            {t("welcomeBack")}
          </h1>
          <p className="text-[var(--aivo-text-secondary)] max-w-md mx-auto mb-6">
            {t("reactivatedDesc")}
          </p>
          <Link href="/manage">
            <Button>{t("backToSubscription")}</Button>
          </Link>
        </div>
      )}

      {/* Confirmation State */}
      {pageState === "confirm" && subscription && (
        <>
          <PurpleGradientHeader className="rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle size={32} />
              <div>
                <h1 className="text-2xl font-extrabold">{t("cancelSubscription")}</h1>
                <p className="text-white/80 text-sm">
                  {t("cancelReviewSubtitle")}
                </p>
              </div>
            </div>
          </PurpleGradientHeader>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Current Plan Summary */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--aivo-text-secondary)]">
                      {t("currentPlanLabel")}
                    </p>
                    <h3 className="text-lg font-bold text-[var(--aivo-text)]">
                      {subscription.plan.name}
                    </h3>
                    <p className="text-sm text-[var(--aivo-text-secondary)]">
                      {t("activeLearnerCount", { count: subscription.learnerCount })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">
                      {subscription.status === "trialing" ? t("trial") : t("active")}
                    </Badge>
                    <p className="text-sm text-[var(--aivo-text-secondary)] mt-1">
                      ${(subscription.plan.price / 100).toFixed(2)}/{subscription.plan.interval}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* What You Will Lose */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <h3 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  {t("whatYouWillLose")}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {loseFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--aivo-text)]">
                          {feature.label}
                        </p>
                        <p className="text-xs text-[var(--aivo-text-secondary)]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t("dataRetentionNotice", { days: 30 })}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Export Brain Data First CTA */}
            <Card className="border-[#7C3AED]/30">
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Brain size={20} className="text-[#7C3AED]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--aivo-text)] mb-1">
                      {t("exportBrainDataFirst")}
                    </h3>
                    <p className="text-sm text-[var(--aivo-text-secondary)] mb-3">
                      {t("exportBrainDataDesc")}
                    </p>
                    <Link href="/parent">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download size={14} />}
                      >
                        {t("goToLearnerSettings")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Confirm Cancellation */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
              <Link href="/manage">
                <Button variant="ghost">{t("keepMySubscription")}</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleCancel}
                loading={cancelling}
                leftIcon={<XCircle size={16} />}
              >
                {t("confirmCancellation")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
