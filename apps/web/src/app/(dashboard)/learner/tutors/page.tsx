"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bot, RefreshCw, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { TutorAvatar, type TutorPersona } from "@/components/tutors/tutor-avatar";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface SubscriptionTutor {
  id: string;
  sku: string;
  status: string;
  activatedAt: string;
  tutor: { name: string; subject: string; persona: string; description: string; };
}

interface DisplayTutor {
  id: string;
  name: string;
  persona: string;
  subject: string;
  description: string;
  activatedAt: string;
}

export default function LearnerTutorsPage() {
  const t = useTranslations("tutor");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [tutors, setTutors] = useState<DisplayTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTutors = useCallback(async (showLoading: boolean) => {
    if (!activeLearner?.id) return;
    try {
      if (showLoading) setLoading(true);
      const data = await apiFetch<{ subscriptions: SubscriptionTutor[] }>(
        API_ROUTES.TUTOR.LIST(activeLearner.id)
      );
      const mapped: DisplayTutor[] = data.subscriptions.map((s) => ({
        id: s.id, name: s.tutor.name, persona: s.tutor.persona, subject: s.tutor.subject, description: s.tutor.description, activatedAt: s.activatedAt,
      }));
      setTutors(mapped);
      setError(null);
    } catch (err) {
      if (showLoading) setError(err instanceof Error ? err.message : "Failed to load tutors");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [activeLearner?.id]);

  useEffect(() => { fetchTutors(true); }, [fetchTutors]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && activeLearner?.id) fetchTutors(false);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeLearner?.id, fetchTutors]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <div className="space-y-4">{[1, 2, 3].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>{t("retry")}</Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome", { defaultValue: "Back to Home" })}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("myTutors")}</h1>
            <p className="text-white/80 text-sm">Your AI learning companions</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {tutors.length === 0 ? (
        <EmptyState
          icon={<Bot size={32} />}
          title={t("noTutorsAvailable")}
          description={t("askParentToSubscribe")}
          delay={200}
        />
      ) : (
        <div className="space-y-3">
          {tutors.map((tutor, idx) => (
            <AnimatedCard key={tutor.id} delay={200 + idx * 80}>
              <Link href={`/learner/tutors/${tutor.persona}`}>
                <Card className="hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer group hover:scale-[1.01]">
                  <CardBody className="flex items-center gap-4">
                    <TutorAvatar persona={tutor.persona as TutorPersona} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{tutor.name}</h3>
                      <p className="text-sm truncate" style={{ color: "var(--aivo-text-secondary)" }}>{tutor.description}</p>
                      {tutor.activatedAt && (
                        <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--aivo-text-muted)" }}>
                          <Clock size={12} />
                          Since: {new Date(tutor.activatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Badge>{tutor.subject}</Badge>
                  </CardBody>
                </Card>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
