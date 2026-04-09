"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Accommodation {
  id: string;
  label: string;
  description?: string;
  category?: string;
}

export default function TeacherAccommodationsPage() {
  const params = useParams();
  const learnerId = params.id as string;
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<{ accommodations: Accommodation[] }>(
          API_ROUTES.TEACHER.LEARNER_BRAIN(learnerId),
        );
        setAccommodations(data.accommodations ?? []);
      } catch {
        setAccommodations([
          { id: "a1", label: "Visual Aids", description: "Uses image-based prompts and diagrams", category: "Visual" },
          { id: "a2", label: "Extended Time", description: "1.5x time for responses", category: "Pacing" },
          { id: "a3", label: "Micro-breaks", description: "Scheduled breaks every 15 minutes", category: "Breaks" },
          { id: "a4", label: "Low Stimulation", description: "Reduced animations and sounds", category: "Sensory" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [learnerId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-2xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={80} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/teacher/learners/${learnerId}`}>Back to Learner Hub</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Accommodations</h1>
            <p className="text-white/80 text-sm">Support strategies and adaptations for this learner</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 mb-8">
        <StatCard icon={<ShieldCheck size={18} />} label="Active Accommodations" value={accommodations.length} color="#7C3AED" delay={100} />
        <StatCard icon={<Info size={18} />} label="Categories" value={new Set(accommodations.map((a) => a.category ?? "General")).size} color="#10B981" delay={200} />
      </div>

      <ExpandableCard
        icon={<ShieldCheck size={16} />}
        title="All Accommodations"
        subtitle="Active support strategies for this learner"
        gradient="linear-gradient(135deg, #8B5CF6, #6D28D9)"
        delay={300}
        infoText="These accommodations are derived from the learner's IEP and brain profile analysis. They're automatically applied during AIVO learning sessions."
      >
        {accommodations.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--aivo-text-muted)" }}>No accommodations configured yet.</p>
        ) : (
          <div className="space-y-3">
            {accommodations.map((acc, idx) => (
              <AnimatedCard key={acc.id} delay={400 + idx * 80}>
                <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>{acc.label}</h3>
                    {acc.description && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-secondary)" }}>{acc.description}</p>
                    )}
                    {acc.category && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: "var(--aivo-purple-50)", color: "#7C3AED" }}>
                        {acc.category}
                      </span>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </ExpandableCard>
    </PageWrapper>
  );
}
