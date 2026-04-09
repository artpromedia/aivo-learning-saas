"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bot, Loader2, RefreshCw, Plus, MessageSquare } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { TutorAvatar, type TutorPersona } from "@/components/tutors/tutor-avatar";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface ActiveTutor { id: string; name: string; persona: string; subject: string; description: string; activatedAt: string; }
interface StoreTutor { sku: string; name: string; subject: string; persona: string; price: number; description: string; subscribed: boolean; }
interface SubscriptionRow { id: string; sku: string; status: string; activatedAt: string; tutor: { name: string; subject: string; persona: string; description: string; }; }

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
        const mapped: ActiveTutor[] = activeResponse.subscriptions.filter((s) => s.tutor).map((s) => ({
          id: s.id, name: s.tutor.name, persona: s.tutor.persona, subject: s.tutor.subject, description: s.tutor.description, activatedAt: s.activatedAt,
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
      await apiFetch(API_ROUTES.TUTOR_SUBSCRIPTION.SUBSCRIBE, { method: "POST", body: JSON.stringify({ learnerId, sku: tutor.sku }) });
      setActiveTutors((prev) => [...prev, { id: tutor.sku, name: tutor.name, persona: tutor.persona, subject: tutor.subject, description: tutor.description, activatedAt: new Date().toISOString() }]);
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
        <div className="grid gap-4 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={160} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  if (error && activeTutors.length === 0 && storeTutors.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>{t("retry")}</Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}`}>{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("aiTutors")}</h1>
            <p className="text-white/80 text-sm">AI-powered tutors that adapt to your child&apos;s unique learning style</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 mb-8">
        <StatCard icon={<Bot size={18} />} label="Active Tutors" value={activeTutors.length} color="#7C3AED" delay={100} />
        <StatCard icon={<MessageSquare size={18} />} label="Available" value={storeTutors.length} color="#2DD4BF" delay={200} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">{error}</div>
      )}

      <ExpandableCard
        icon={<Bot size={16} />}
        title={t("activeTutorsCount", { count: activeTutors.length })}
        subtitle="Your child's current AI learning companions"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={300}
        infoText="Active tutors are AI learning companions currently working with your child. Each tutor specializes in a subject and has a unique teaching personality adapted to your child's needs."
      >
        {activeTutors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeTutors.map((tutor) => (
              <div key={tutor.id} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02]" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <TutorAvatar persona={tutor.persona as TutorPersona} size="sm" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{tutor.name}</h3>
                  <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{tutor.subject}</p>
                </div>
                <Link href={`/learner/tutors/${tutor.persona}`}>
                  <Button size="sm" variant="outline">{t("chat")}</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bot className="mx-auto mb-3" size={40} style={{ color: "var(--aivo-text-muted)" }} />
            <p style={{ color: "var(--aivo-text-secondary)" }}>{t("noActiveTutors")}</p>
          </div>
        )}
      </ExpandableCard>

      {storeTutors.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Plus size={16} />}
            title={t("tutorStoreLabel")}
            subtitle="Add more AI tutors to help your child learn"
            gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
            delay={400}
            infoText="Browse available AI tutors and subscribe to add them to your child's learning team. Each tutor has unique strengths and teaching approaches."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {storeTutors.map((tutor) => (
                <div key={tutor.sku} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="flex items-start gap-4 mb-3">
                    <TutorAvatar persona={tutor.persona as TutorPersona} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{tutor.name}</h3>
                      <p className="text-sm mb-1" style={{ color: "var(--aivo-text-secondary)" }}>{tutor.description}</p>
                      <span className="text-xs font-medium" style={{ color: "var(--aivo-text-muted)" }}>${tutor.price.toFixed(2)}/mo</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" leftIcon={<Plus size={16} />} loading={subscribingSku === tutor.sku} onClick={() => handleSubscribe(tutor)}>{t("subscribe")}</Button>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      )}
    </PageWrapper>
  );
}
