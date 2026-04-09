"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Brain, ArrowLeft, Loader2, RefreshCw, Sparkles, Eye, MessageCircle, Star, Zap, Shield, TrendingUp } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useBrain } from "@/hooks/useBrain";
import { useTranslations } from "next-intl";

function AnimatedBrainOrb() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, #A855F7, #7C3AED 40%, #6D28D9 70%, #4C1D95)",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.3), transparent 60%)",
          animation: "float 4s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Brain size={48} className="text-white drop-shadow-lg" style={{ animation: "float 3s ease-in-out infinite" }} />
      </div>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ["#2DD4BF", "#FB923C", "#38BDF8", "#F472B6", "#FBBF24", "#34D399"][i],
            top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 6)}%`,
            left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 6)}%`,
            transform: "translate(-50%, -50%)",
            animation: `orbit-dot ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

function AdaptationBar({ label, strength, color, delay }: { label: string; strength: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(strength * 100), 100 + delay);
    return () => clearTimeout(timer);
  }, [strength, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{Math.round(strength * 100)}%</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }: { icon: React.ReactNode; label: string; value: string; color: string; delay: number }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}25`,
        animation: "pop-in 0.5s ease-out both",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}BB)` }}
      >
        {icon}
      </div>
      <div className="text-lg font-extrabold" style={{ color }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{label}</div>
    </div>
  );
}

export default function BrainProfilePage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const { profile, isLoading, error } = useBrain(learnerId);
  const t = useTranslations("brain");

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-[var(--aivo-text-secondary)]">{t("loadingBrainProfile")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <Brain className="mx-auto mb-4 text-[#A89BB5]" size={48} />
        <h2 className="text-xl font-extrabold text-[var(--aivo-text)] mb-2">
          {t("noBrainProfileYet")}
        </h2>
        <p className="text-[var(--aivo-text-secondary)] mb-6">
          {t("noBrainProfileDesc")}
        </p>
        <Link href={`/baseline-assessment?learnerId=${learnerId}`}>
          <Button variant="primary" leftIcon={<Brain size={16} />}>
            {t("startBaselineAssessment")}
          </Button>
        </Link>
      </div>
    );
  }

  const functioningLevelLabel: Record<string, string> = {
    STANDARD: t("standardLabel"),
    SUPPORTED: t("supportedLabel"),
    LOW_VERBAL: t("lowVerbalLabel"),
    NON_VERBAL: t("nonVerbalLabel"),
    PRE_SYMBOLIC: t("preSymbolicLabel"),
  };

  const levelColorMap: Record<string, string> = {
    STANDARD: "#34D399",
    SUPPORTED: "#FBBF24",
    LOW_VERBAL: "#FB923C",
    NON_VERBAL: "#F472B6",
    PRE_SYMBOLIC: "#A855F7",
  };

  const adaptationColors = ["#7C3AED", "#2DD4BF", "#FB923C", "#38BDF8", "#F472B6", "#34D399"];
  const strengthIcons = [Star, Zap, Sparkles, TrendingUp, Shield, Brain];

  return (
    <div>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(124,58,237,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(124,58,237,0.5); }
        }
        @keyframes orbit-dot {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%,-50%) scale(1.5); opacity: 1; }
        }
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold rounded-xl px-3 py-1.5 transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--aivo-purple-500)]"
        style={{ color: "var(--aivo-purple-500)", backgroundColor: "var(--aivo-purple-50)" }}
      >
        <ArrowLeft size={14} />
        {t("backToDashboard")}
      </Link>

      <div
        className="relative mt-4 mb-8 rounded-3xl overflow-hidden p-8"
        style={{
          background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 30%, #A855F7 60%, #2DD4BF 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-24 h-24 rounded-full bg-white/20" style={{ animation: "float 5s ease-in-out infinite" }} />
          <div className="absolute bottom-6 left-8 w-16 h-16 rounded-full bg-white/15" style={{ animation: "float 4s ease-in-out infinite 1s" }} />
          <div className="absolute top-8 left-1/4 w-10 h-10 rounded-full bg-white/10" style={{ animation: "float 6s ease-in-out infinite 0.5s" }} />
        </div>

        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          <AnimatedBrainOrb />

          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">{t("aiGeneratedProfile")}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {t("brainProfile")}
            </h1>
            <p className="text-white/80 text-sm max-w-md">
              {t("howAivoLearnsDesc")}
            </p>
            <div className="flex items-center gap-3 mt-4 justify-center lg:justify-start">
              <Badge
                className="!rounded-full !px-3 !py-1.5 !text-sm !font-bold"
                style={{
                  backgroundColor: `${levelColorMap[profile.functioningLevel] ?? "#7C3AED"}30`,
                  color: "white",
                  border: `1px solid ${levelColorMap[profile.functioningLevel] ?? "#7C3AED"}60`,
                }}
              >
                {functioningLevelLabel[profile.functioningLevel] ?? profile.functioningLevel}
              </Badge>
              <span className="text-white/85 text-xs">
                {t("confidenceScore")}: {Math.round((profile.confidenceScore ?? 0.82) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Star size={18} />}
          label={t("strengths")}
          value={`${profile.strengths.length}`}
          color="#34D399"
          delay={0}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label={t("growthAreas")}
          value={`${profile.challenges.length}`}
          color="#FB923C"
          delay={100}
        />
        <StatCard
          icon={<Zap size={18} />}
          label={t("activeAdaptations")}
          value={`${profile.adaptations?.length ?? 0}`}
          color="#7C3AED"
          delay={200}
        />
        <StatCard
          icon={<Shield size={18} />}
          label={t("sensoryPreferences")}
          value={`${profile.sensoryPreferences?.length ?? 0}`}
          color="#38BDF8"
          delay={300}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "200ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #34D399, #2DD4BF)" }}>
                <Star size={16} />
              </div>
              <h3 className="font-extrabold" style={{ color: "var(--aivo-text)" }}>
                {t("strengths")}
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {profile.strengths.map((s, i) => {
                const IconComp = strengthIcons[i % strengthIcons.length];
                const color = ["#34D399", "#2DD4BF", "#38BDF8", "#7C3AED", "#FBBF24", "#F472B6"][i % 6];
                return (
                  <div
                    key={s}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: `${color}10`,
                      animation: "slide-up 0.4s ease-out both",
                      animationDelay: `${300 + i * 100}ms`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <IconComp size={14} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "300ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #FB923C, #F472B6)" }}>
                <TrendingUp size={16} />
              </div>
              <h3 className="font-extrabold" style={{ color: "var(--aivo-text)" }}>
                {t("growthAreas")}
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {profile.challenges.map((c, i) => (
                <div
                  key={c}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: "#FB923C10",
                    animation: "slide-up 0.4s ease-out both",
                    animationDelay: `${400 + i * 100}ms`,
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#FB923C20", color: "#FB923C" }}>
                    <TrendingUp size={14} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{c}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "400ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #38BDF8, #7C3AED)" }}>
                <Eye size={16} />
              </div>
              <h3 className="font-extrabold" style={{ color: "var(--aivo-text)" }}>
                {t("learningStyle")}
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{profile.learningStyle}</p>
          </CardBody>
        </Card>

        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "500ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #F472B6, #A855F7)" }}>
                <MessageCircle size={16} />
              </div>
              <h3 className="font-extrabold" style={{ color: "var(--aivo-text)" }}>
                {t("communicationStyle")}
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{profile.communicationStyle}</p>
          </CardBody>
        </Card>
      </div>

      {profile.adaptations && profile.adaptations.length > 0 && (
        <Card className="!rounded-2xl overflow-hidden mb-4" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "600ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                <Zap size={16} />
              </div>
              <h3 className="font-extrabold" style={{ color: "var(--aivo-text)" }}>
                {t("adaptations")}
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {profile.adaptations.map((a: { label: string; description: string; strength: number }, i: number) => (
              <div key={a.label}>
                <AdaptationBar
                  label={a.label}
                  strength={a.strength}
                  color={adaptationColors[i % adaptationColors.length]}
                  delay={i * 150}
                />
                <p className="text-xs mt-1" style={{ color: "var(--aivo-text-muted)" }}>{a.description}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {profile.sensoryPreferences && profile.sensoryPreferences.length > 0 && (
        <Card className="!rounded-2xl overflow-hidden mb-4" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "700ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #38BDF8, #2DD4BF)" }}>
                <Shield size={16} />
              </div>
              <h3 className="font-extrabold" style={{ color: "var(--aivo-text)" }}>
                {t("sensoryPreferences")}
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid sm:grid-cols-2 gap-2">
              {profile.sensoryPreferences.map((p, i) => (
                <div
                  key={p}
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{
                    backgroundColor: "#38BDF810",
                    border: "1px solid #38BDF815",
                    animation: "slide-up 0.4s ease-out both",
                    animationDelay: `${800 + i * 100}ms`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#38BDF8" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{p}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex items-center justify-between mt-6" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "900ms" }}>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--aivo-text-muted)" }}>
          <span>{t("lastUpdated", { date: new Date(profile.updatedAt).toLocaleDateString() })}</span>
          {profile.modelVersion && <span>{t("modelVersion")}: {profile.modelVersion}</span>}
        </div>
        <Link
          href={`/parent/${learnerId}/functioning-level`}
          className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--aivo-purple-500)]"
          style={{ color: "#7C3AED", backgroundColor: "var(--aivo-purple-50)" }}
        >
          {t("viewFunctioningLevel")} →
        </Link>
      </div>
    </div>
  );
}
