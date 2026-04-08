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
        <Skeleton height={80} className="w-full rounded-xl" />
        <Skeleton height={200} className="w-full rounded-lg" />
        <Skeleton height={150} className="w-full rounded-lg" />
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
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        {t("backToSubscription")}
      </Link>

      {/* Cancelled Success State */}
      {pageState === "cancelled" && subscription && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("subscriptionCancelled")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {t("cancelledGraceInfo", { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() })}
            </p>
          </div>

          <Card>
            <CardBody className="text-center py-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-3">
                <Download size={18} className="text-[#7C3AED]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("exportYourData")}
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("welcomeBack")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
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
          <PurpleGradientHeader className="rounded-xl mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle size={32} />
              <div>
                <h1 className="text-2xl font-bold">{t("cancelSubscription")}</h1>
                <p className="text-white/80 text-sm">
                  {t("cancelReviewSubtitle")}
                </p>
              </div>
            </div>
          </PurpleGradientHeader>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Current Plan Summary */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("currentPlanLabel")}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {subscription.plan.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("activeLearnerCount", { count: subscription.learnerCount })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">
                      {subscription.status === "trialing" ? t("trial") : t("active")}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      ${subscription.plan.price}/{subscription.plan.interval}
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
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {feature.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
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
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Brain size={20} className="text-[#7C3AED]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {t("exportBrainDataFirst")}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
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
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
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
