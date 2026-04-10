"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  interval: "month" | "year";
  features: string[];
  recommended: boolean;
  maxLearners: number;
  trialDays: number;
  contactSales?: boolean;
  includedTutors?: string[];
}

function CheckoutContent() {
  const t = useTranslations("billing");
  const searchParams = useSearchParams();
  const preselectedPlanId = searchParams.get("plan");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    preselectedPlanId,
  );
  const [subscribing, setSubscribing] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ plans: Plan[] }>(API_ROUTES.BILLING.PLANS);
      setPlans(data.plans);
      if (!selectedPlan && data.plans.length > 0) {
        const recommended = data.plans.find((p) => p.recommended);
        setSelectedPlan(recommended?.id ?? data.plans[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadPlans"));
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, t]);

  useEffect(() => { fetchPlans(); }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    const plan = plans.find((p) => p.id === selectedPlan);
    if (plan?.contactSales) return;
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
      globalThis.window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToStartCheckout"));
      setSubscribing(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <Skeleton height={40} width={300} className="mb-8 mx-auto" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={400} className="w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Link
        href="/parent"
        className="inline-flex items-center gap-1 text-sm text-(--aivo-text-secondary) hover:text-(--aivo-text) dark:text-(--aivo-text-muted) dark:hover:text-[#A89BB5] mb-6"
      >
        <ArrowLeft size={16} />
        {t("backToDashboard")}
      </Link>

      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-(--aivo-text) mb-2">
          {t("chooseYourPlan")}
        </h1>
        <p className="text-(--aivo-text-secondary)">
          {t("choosePlanSubtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-center">
          <p className="text-[#991B1B] dark:text-[#F87171] text-sm mb-3">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchPlans();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {plans.map((plan) => {
          const displayPrice = (plan.price / 100).toFixed(2);
          const learnersLabel =
            plan.maxLearners === -1
              ? t("unlimitedLearners")
              : t("upToLearners", { count: plan.maxLearners });

          if (plan.contactSales) {
            return (
              <Card
                key={plan.id}
                className="transition-all relative hover:shadow-(--shadow-card) border-[#E8DDF0]"
              >
                <CardBody className="text-center pt-8">
                  <h3 className="text-lg font-bold text-(--aivo-text) mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-(--aivo-text-secondary) mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-(--aivo-text)">
                      {t("contactUs")}
                    </span>
                  </div>
                  <p className="text-xs text-(--aivo-text-secondary) mb-6">
                    {learnersLabel}
                  </p>
                  <ul className="space-y-2 text-left mb-6">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-(--aivo-text-secondary)"
                      >
                        <Check
                          className="text-[#7C3AED] shrink-0 mt-0.5"
                          size={16}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://aivolearning.com/demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-2xl bg-(--aivo-bg-alt,#FFF5EB) px-4 py-2.5 text-center text-sm font-semibold text-(--aivo-text) hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C] transition-colors"
                  >
                    {t("contactSales")}
                  </a>
                </CardBody>
              </Card>
            );
          }

          return (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all relative ${
                selectedPlan === plan.id
                  ? "ring-2 ring-[#7C3AED] shadow-(--shadow-playful)"
                  : "hover:shadow-(--shadow-card)"
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
                <h3 className="text-lg font-bold text-(--aivo-text) mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-(--aivo-text-secondary) mb-4">
                  {plan.description}
                </p>
                {plan.trialDays > 0 && (
                  <Badge className="bg-green-100 text-green-700 mb-3">
                    {t("trialBadge", { days: plan.trialDays })}
                  </Badge>
                )}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-(--aivo-text)">
                    ${displayPrice}
                  </span>
                  <span className="text-(--aivo-text-secondary)">
                    {t("perInterval", { interval: plan.interval })}
                  </span>
                  {plan.trialDays > 0 && (
                    <p className="text-xs text-(--aivo-text-secondary) mt-1">
                      {t("afterTrial", { days: plan.trialDays })}
                    </p>
                  )}
                </div>
                <p className="text-xs text-(--aivo-text-secondary) mb-6">
                  {learnersLabel}
                </p>
                <ul className="space-y-2 text-left">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-(--aivo-text-secondary)"
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
          );
        })}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          onClick={handleSubscribe}
          loading={subscribing}
          disabled={!selectedPlan || selectedPlanData?.contactSales}
          className="min-w-60"
        >
          {(() => {
            if (selectedPlanData?.trialDays) return t("startTrial", { days: selectedPlanData.trialDays });
            if (selectedPlanData?.contactSales) return t("contactSales");
            return t("continueToPayment");
          })()}
        </Button>
        {selectedPlanData?.trialDays ? (
          <p className="text-xs text-(--aivo-text-secondary) mt-2">
            {t("trialReassurance", { days: selectedPlanData.trialDays })}
          </p>
        ) : null}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#A89BB5]">
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
