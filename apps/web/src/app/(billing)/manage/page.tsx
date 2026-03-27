"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  RefreshCw,
  ExternalLink,
  Package,
  Receipt,
  Plus,
  Check,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface SubscriptionData {
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
  addOns: { id: string; name: string; price: number; active: boolean }[];
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  invoices: {
    id: string;
    amount: number;
    status: "paid" | "open" | "void";
    date: string;
    pdfUrl: string;
  }[];
}

export default function ManageSubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const result = await apiFetch<SubscriptionData>(
          API_ROUTES.BILLING.CURRENT,
        );
        setData(result);
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

  const handleManageBilling = async () => {
    setOpeningPortal(true);
    try {
      const { url } = await apiFetch<{ url: string }>(
        API_ROUTES.BILLING.PORTAL,
        { method: "POST" },
      );
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal");
      setOpeningPortal(false);
    }
  };

  const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
    active: "success",
    trialing: "default",
    past_due: "error",
    canceled: "secondary" as "default",
  };

  const statusLabel: Record<string, string> = {
    active: "Active",
    trialing: "Trial",
    past_due: "Past Due",
    canceled: "Canceled",
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <Skeleton height={200} className="w-full rounded-lg" />
        <Skeleton height={150} className="w-full rounded-lg" />
        <Skeleton height={200} className="w-full rounded-lg" />
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link
        href="/parent"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <CreditCard size={32} />
          <div>
            <h1 className="text-2xl font-bold">Subscription Management</h1>
            <p className="text-white/80 text-sm">
              Manage your plan, add-ons, and payment method.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={18} className="text-[#7C3AED]" />
                  Current Plan
                </h3>
                <Badge variant={statusVariant[data.status]}>
                  {statusLabel[data.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {data.plan.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Up to {data.plan.maxLearners} learner
                    {data.plan.maxLearners > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${data.plan.price}
                  </span>
                  <span className="text-gray-500">
                    /{data.plan.interval}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {data.cancelAtPeriodEnd
                  ? `Cancels on ${new Date(data.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews on ${new Date(data.currentPeriodEnd).toLocaleDateString()}`}
              </p>
              <div className="flex gap-2">
                <Link href="/checkout">
                  <Button size="sm" variant="outline">
                    Change Plan
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleManageBilling}
                  loading={openingPortal}
                  rightIcon={<ExternalLink size={14} />}
                >
                  Billing Portal
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Add-ons */}
          {data.addOns.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Plus size={18} className="text-[#7C3AED]" />
                  Add-ons
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {data.addOns.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {addon.active ? (
                        <Check
                          className="text-green-500 shrink-0"
                          size={16}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {addon.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      +${addon.price}/mo
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-[#7C3AED]" />
                Payment Method
              </h3>
            </CardHeader>
            <CardBody>
              {data.paymentMethod ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      {data.paymentMethod.brand}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        **** **** **** {data.paymentMethod.last4}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires {data.paymentMethod.expMonth}/
                        {data.paymentMethod.expYear}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleManageBilling}
                    loading={openingPortal}
                  >
                    Update
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No payment method on file.
                  </p>
                  <Button size="sm" onClick={handleManageBilling} loading={openingPortal}>
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt size={18} className="text-[#7C3AED]" />
                Invoices
              </h3>
            </CardHeader>
            <CardBody>
              {data.invoices.length > 0 ? (
                <div className="space-y-3">
                  {data.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(invoice.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "success"
                              : invoice.status === "open"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {invoice.status}
                        </Badge>
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-gray-400 hover:text-[#7C3AED] transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No invoices yet.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
