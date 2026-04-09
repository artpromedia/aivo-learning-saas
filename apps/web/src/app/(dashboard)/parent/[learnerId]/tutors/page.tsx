"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Loader2,
  RefreshCw,
  Plus,
  Star,
  MessageSquare,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { TutorAvatar, type TutorPersona } from "@/components/tutors/tutor-avatar";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface ActiveTutor {
  id: string;
  name: string;
  persona: string;
  subject: string;
  description: string;
  activatedAt: string;
}

interface StoreTutor {
  sku: string;
  name: string;
  subject: string;
  persona: string;
  price: number;
  description: string;
  subscribed: boolean;
}

interface SubscriptionRow {
  id: string;
  sku: string;
  status: string;
  activatedAt: string;
  tutor: {
    name: string;
    subject: string;
    persona: string;
    description: string;
  };
}

export default function TutorsPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const t = useTranslations("dashboard");

  const [activeTutors, setActiveTutors] = useState<ActiveTutor[]>([]);
  const [storeTutors, setStoreTutors] = useState<StoreTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingSku, setSubscribingSku] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const [activeResponse, storeResponse] = await Promise.all([
          apiFetch<{ subscriptions: SubscriptionRow[] }>(API_ROUTES.TUTOR.LIST(learnerId)),
          apiFetch<{ catalog: StoreTutor[] }>(API_ROUTES.TUTOR.STORE(learnerId)),
        ]);

        const mapped: ActiveTutor[] = activeResponse.subscriptions
          .filter((s) => s.tutor)
          .map((s) => ({
            id: s.id,
            name: s.tutor.name,
            persona: s.tutor.persona,
            subject: s.tutor.subject,
            description: s.tutor.description,
            activatedAt: s.activatedAt,
          }));
        setActiveTutors(mapped);
        setStoreTutors(storeResponse.catalog.filter((t) => !t.subscribed));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadTutors"));
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, [learnerId]);

  const handleSubscribe = async (tutor: StoreTutor) => {
    setSubscribingSku(tutor.sku);
    try {
      await apiFetch(API_ROUTES.TUTOR_SUBSCRIPTION.SUBSCRIBE, {
        method: "POST",
        body: JSON.stringify({ learnerId, sku: tutor.sku }),
      });
      setActiveTutors((prev) => [
        ...prev,
        {
          id: tutor.sku,
          name: tutor.name,
          persona: tutor.persona,
          subject: tutor.subject,
          description: tutor.description,
          activatedAt: new Date().toISOString(),
        },
      ]);
      setStoreTutors((prev) => prev.filter((t) => t.sku !== tutor.sku));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSubscribe"));
    } finally {
      setSubscribingSku(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={160} className="w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && activeTutors.length === 0 && storeTutors.length === 0) {
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
    <div>
      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--aivo-text-secondary)] hover:text-[var(--aivo-text)] dark:text-[var(--aivo-text-muted)] dark:hover:text-[#A89BB5] mb-4"
      >
        <ArrowLeft size={16} />
        {t("backToDashboard")}
      </Link>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <Bot size={32} />
          <div>
            <h1 className="text-2xl font-extrabold">{t("aiTutors")}</h1>
            <p className="text-white/80 text-sm">
              {t("aiTutorsSubtitle")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
          {error}
        </div>
      )}

      <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-4">
        {t("activeTutorsCount", { count: activeTutors.length })}
      </h2>

      {activeTutors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {activeTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-[var(--shadow-card)] transition-all">
              <CardBody className="flex items-center gap-4">
                <TutorAvatar
                  persona={tutor.persona as TutorPersona}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--aivo-text)]">
                    {tutor.name}
                  </h3>
                  <p className="text-sm text-[var(--aivo-text-secondary)]">
                    {tutor.subject}
                  </p>
                </div>
                <Link href={`/learner/tutors/${tutor.persona}`}>
                  <Button size="sm" variant="outline">
                    {t("chat")}
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-10">
          <CardBody className="text-center py-8">
            <Bot className="mx-auto mb-3 text-[#A89BB5]" size={40} />
            <p className="text-[var(--aivo-text-secondary)]">
              {t("noActiveTutors")}
            </p>
          </CardBody>
        </Card>
      )}

      <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-4">
        {t("tutorStoreLabel")}
      </h2>

      {storeTutors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {storeTutors.map((tutor) => (
            <Card key={tutor.sku}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <TutorAvatar
                    persona={tutor.persona as TutorPersona}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--aivo-text)]">
                      {tutor.name}
                    </h3>
                    <p className="text-sm text-[var(--aivo-text-secondary)] mb-2">
                      {tutor.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--aivo-text-muted)] mb-3">
                      <span>${tutor.price.toFixed(2)}/mo</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  leftIcon={<Plus size={16} />}
                  loading={subscribingSku === tutor.sku}
                  onClick={() => handleSubscribe(tutor)}
                >
                  {t("subscribe")}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-[var(--aivo-text-secondary)]">
              {t("noAdditionalTutors")}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
