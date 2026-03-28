"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
          "/api/billing/subscriptions/current",
        );
        setSubscription(result);
        if (result.cancelAtPeriodEnd) {
          setPageState("cancelled");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load subscription data",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    setError(null);
    try {
      await apiFetch(`/api/billing/subscriptions/${subscription.id}/cancel`, {
        method: "POST",
      });
      setPageState("cancelled");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel subscription",
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
        `/api/billing/subscriptions/${subscription.id}/reactivate`,
        { method: "POST" },
      );
      setPageState("reactivated");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reactivate subscription",
      );
    } finally {
      setReactivating(false);
    }
  };

  const loseFeatures = [
    {
      icon: <Brain size={18} />,
      label: "AI-powered brain profiles",
      description: "Personalized learning adaptations will stop updating",
    },
    {
      icon: <BarChart3 size={18} />,
      label: "Progress analytics",
      description: "Real-time tracking and insights will be unavailable",
    },
    {
      icon: <Users size={18} />,
      label: "Collaborator access",
      description: "Teachers and therapists will lose shared access",
    },
    {
      icon: <Sparkles size={18} />,
      label: "Adaptive learning sessions",
      description: "AI-driven session recommendations will stop",
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
          Retry
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
        Back to subscription
      </Link>

      {/* Cancelled Success State */}
      {pageState === "cancelled" && subscription && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your subscription has been cancelled
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You have 30 days to resubscribe without losing data. Your access
              continues until{" "}
              <span className="font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
              .
            </p>
          </div>

          <Card>
            <CardBody className="text-center py-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Changed your mind? You can reactivate your subscription at any
                time during the grace period.
              </p>
              <Button
                onClick={handleReactivate}
                loading={reactivating}
                leftIcon={<RefreshCw size={16} />}
              >
                Resubscribe
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
                  Export your data
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Make sure to download your brain data and learning history before
                the grace period ends.
              </p>
              <Link href="/parent">
                <Button variant="outline" leftIcon={<Download size={16} />}>
                  Go to Learner Settings to Export
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
            Welcome back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Your subscription has been reactivated. All your data and features
            are fully restored.
          </p>
          <Link href="/manage">
            <Button>Back to Subscription Management</Button>
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
                <h1 className="text-2xl font-bold">Cancel Subscription</h1>
                <p className="text-white/80 text-sm">
                  Review what you will lose before confirming.
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
                      Current plan
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {subscription.plan.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {subscription.learnerCount} active learner
                      {subscription.learnerCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">
                      {subscription.status === "trialing" ? "Trial" : "Active"}
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
                  What you will lose during the grace period
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
                    After cancellation, your data will be retained for{" "}
                    <span className="font-medium">30 days</span>. You can
                    resubscribe at any time during this period without losing any
                    data.
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
                      Export Brain Data First
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Before cancelling, we recommend exporting your
                      learner&apos;s brain data so you have a complete backup of
                      their learning profiles and progress history.
                    </p>
                    <Link href="/parent">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download size={14} />}
                      >
                        Go to Learner Settings to Export
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Confirm Cancellation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/manage">
                <Button variant="ghost">Keep My Subscription</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleCancel}
                loading={cancelling}
                leftIcon={<XCircle size={16} />}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
