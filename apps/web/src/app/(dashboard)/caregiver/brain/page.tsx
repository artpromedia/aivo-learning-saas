"use client";

import React, { useEffect, useState } from "react";
import { Brain, Lightbulb, Zap, Eye, Headphones } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface BrainProfile {
  learningStyle: string;
  communicationStyle: string;
  strengths: string[];
  challenges: string[];
  sensoryPreferences: string[];
  adaptations: { label: string; description: string; strength: number }[];
}

export default function CaregiverBrainPage() {
  const [profile, setProfile] = useState<BrainProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<BrainProfile>("/api/caregiver/child/brain-profile");
        setProfile(data);
      } catch {
        setProfile({
          learningStyle: "Visual-spatial learner who excels with diagrams, color-coded information, and hands-on activities.",
          communicationStyle: "Responds well to clear, concise instructions with visual supports. Prefers written over verbal directions.",
          strengths: ["Visual Learning", "Pattern Recognition", "Creative Thinking", "Mathematics"],
          challenges: ["Auditory Processing", "Time Management", "Social Communication"],
          sensoryPreferences: ["Low noise environments", "Dim lighting preferred", "Fidget tools helpful"],
          adaptations: [
            { label: "Visual Aids", description: "Uses image-based prompts", strength: 0.85 },
            { label: "Extended Time", description: "1.5x time for responses", strength: 0.7 },
            { label: "Micro-breaks", description: "Scheduled breaks every 15 min", strength: 0.6 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={150} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <PageWrapper>
      <BackLink href="/caregiver">Back to Dashboard</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20"><Brain size={22} /></div>
          <div>
            <h1 className="text-2xl font-extrabold">Brain Profile</h1>
            <p className="text-white/80 text-sm">AI-generated learning insights and preferences</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<Lightbulb size={18} />} label="Strengths" value={profile.strengths.length} color="#10B981" delay={100} />
        <StatCard icon={<Zap size={18} />} label="Challenges" value={profile.challenges.length} color="#F59E0B" delay={200} />
        <StatCard icon={<Eye size={18} />} label="Adaptations" value={profile.adaptations.length} color="#7C3AED" delay={300} />
        <StatCard icon={<Headphones size={18} />} label="Sensory Prefs" value={profile.sensoryPreferences.length} color="#3B82F6" delay={400} />
      </div>

      <ExpandableCard icon={<Brain size={16} />} title="Learning Style" subtitle="How this child processes information best" gradient="linear-gradient(135deg, #7C3AED, #A855F7)" delay={500} infoText="AIVO identifies learning styles through session data, response patterns, and engagement metrics.">
        <p className="text-sm" style={{ color: "var(--aivo-text)" }}>{profile.learningStyle}</p>
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard icon={<Lightbulb size={16} />} title="Communication Style" subtitle="How to best communicate with this child" gradient="linear-gradient(135deg, #F59E0B, #D97706)" delay={600} infoText="Understanding communication preferences helps tailor instructions and feedback.">
          <p className="text-sm" style={{ color: "var(--aivo-text)" }}>{profile.communicationStyle}</p>
        </ExpandableCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <AnimatedCard delay={700}>
          <div className="rounded-3xl p-6" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "var(--aivo-text)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}><Lightbulb size={16} /></div>
              Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.strengths.map((s) => (<span key={s} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#D1FAE5", color: "#059669" }}>{s}</span>))}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={800}>
          <div className="rounded-3xl p-6" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "var(--aivo-text)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}><Zap size={16} /></div>
              Challenges
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.challenges.map((c) => (<span key={c} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>{c}</span>))}
            </div>
          </div>
        </AnimatedCard>
      </div>

      <div className="mt-6">
        <ExpandableCard icon={<Headphones size={16} />} title="Sensory Preferences" subtitle="Environmental and sensory needs" gradient="linear-gradient(135deg, #8B5CF6, #6D28D9)" delay={900} infoText="Sensory preferences help create the optimal learning environment.">
          <ul className="space-y-2">
            {profile.sensoryPreferences.map((pref) => (
              <li key={pref} className="flex items-center gap-2 text-sm" style={{ color: "var(--aivo-text)" }}>
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0" />
                {pref}
              </li>
            ))}
          </ul>
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}
