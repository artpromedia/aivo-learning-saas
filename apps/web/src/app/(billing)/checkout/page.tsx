"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Check,
  Loader2,
  ArrowLeft,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  recommended: boolean;
  maxLearners: number;
}

function CheckoutContent() {
  const t = useTranslations("billing");
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlanId = searchParams.get("plan");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    preselectedPlanId,
  );
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await apiFetch<Plan[]>(API_ROUTES.BILLING.PLANS);
        setPlans(data);
        if (!selectedPlan && data.length > 0) {
          const recommended = data.find((p) => p.recommended);
          setSelectedPlan(recommended?.id ?? data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadPlans"));
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubscribing(true);
    setError(null);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>(
        API_ROUTES.BILLING.SUBSCRIBE,
        {
          method: "POST",
          body: JSON.stringify({ planId: selectedPlan }),
        },
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToStartCheckout"));
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Skeleton height={40} width={300} className="mb-8 mx-auto" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={400} className="w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link
        href="/parent"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft size={16} />
        {t("backToDashboard")}
      </Link>

      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("chooseYourPlan")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("choosePlanSubtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all relative ${
              selectedPlan === plan.id
                ? "ring-2 ring-[#7C3AED] shadow-lg"
                : "hover:shadow-md"
            } ${plan.recommended ? "border-[#7C3AED]" : ""}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#7C3AED] text-white px-3 py-1 flex items-center gap-1">
                  <Sparkles size={12} />
                  {t("recommended")}
                </Badge>
              </div>
            )}
            <CardBody className="text-center pt-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {t("perInterval", { interval: plan.interval })}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                {t("upToLearners", { count: plan.maxLearners })}
              </p>
              <ul className="space-y-2 text-left">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <Check
                      className="text-[#7C3AED] shrink-0 mt-0.5"
                      size={16}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          onClick={handleSubscribe}
          loading={subscribing}
          disabled={!selectedPlan}
          className="min-w-[240px]"
        >
          {t("continueToPayment")}
        </Button>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
          <Shield size={14} />
          <span>{t("securePayment")}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#7C3AED]" size={32} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
