"use client";

import Link from "next/link";
import { Brain, Palette, BarChart3, Shield, Heart, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function LandingPage() {
  const t = useTranslations("landing");

  const features = [
    { icon: <Brain size={28} />, titleKey: "adaptiveAi", descKey: "adaptiveAiDescription", color: "#7C3AED", bgColor: "#F0E6FF" },
    { icon: <Palette size={28} />, titleKey: "sensoryFriendly", descKey: "sensoryFriendlyDescription", color: "#2DD4BF", bgColor: "#CCFBF1" },
    { icon: <BarChart3 size={28} />, titleKey: "progressTracking", descKey: "progressTrackingDescription", color: "#F472B6", bgColor: "#FCE7F3" },
    { icon: <Shield size={28} />, titleKey: "coppaFerpa", descKey: "coppaFerpaDescription", color: "#38BDF8", bgColor: "#E0F2FE" },
    { icon: <Heart size={28} />, titleKey: "iepIntegration", descKey: "iepIntegrationDescription", color: "#FF6B6B", bgColor: "#FFE0E0" },
    { icon: <Sparkles size={28} />, titleKey: "questBasedLearning", descKey: "questBasedLearningDescription", color: "#FBBF24", bgColor: "#FEF3C7" },
  ];

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <nav className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <AivoLogo size="md" />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link href="/login" className="px-5 py-2 text-sm font-bold rounded-2xl transition-colors" style={{ color: "var(--aivo-purple-600)" }}>
              {t("signIn")}
            </Link>
            <Link href="/get-started" className="px-5 py-2 text-sm font-bold text-white rounded-2xl transition-all shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)]" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
              {t("getStartedFree")}
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden bg-bubbles">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 animate-float" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }} />
        <div className="absolute bottom-20 right-16 w-24 h-24 rounded-full opacity-15 animate-float" style={{ background: "linear-gradient(135deg, #2DD4BF, #38BDF8)", animationDelay: "1s" }} />
        <div className="absolute top-32 right-1/4 w-16 h-16 rounded-full opacity-10 animate-float" style={{ background: "linear-gradient(135deg, #F472B6, #FB923C)", animationDelay: "2s" }} />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
          <Sparkles size={16} style={{ color: "var(--aivo-purple-500)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--aivo-purple-600)" }}>
            {t("aiPoweredBadge")}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight max-w-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--aivo-text)" }}>
          {t("heroTitle")}{" "}
          <span style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7, #2DD4BF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t("heroTitleHighlight")}
          </span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>
          {t("heroDescription")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-bold text-white transition-all shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)] hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
          >
            {t("startLearningFree")}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border-2 px-8 py-4 text-lg font-bold transition-all hover:scale-105"
            style={{ borderColor: "var(--aivo-purple-300)", color: "var(--aivo-purple-600)", backgroundColor: "var(--aivo-purple-50)" }}
          >
            {t("signIn")}
          </Link>
        </div>
      </section>

      <section className="py-20 px-6" style={{ backgroundColor: "var(--aivo-bg-alt)" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--aivo-text)" }}>
            {t("builtForEveryLearner")}
          </h2>
          <p className="text-center mb-14 text-lg" style={{ color: "var(--aivo-text-secondary)" }}>
            {t("builtForEveryLearnerSubtitle")}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard
                key={f.titleKey}
                icon={f.icon}
                title={t(f.titleKey)}
                description={t(f.descKey)}
                color={f.color}
                bgColor={f.bgColor}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ backgroundColor: "var(--aivo-bg)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #2DD4BF 100%)" }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-12 w-24 h-24 rounded-full bg-white/20" />
              <div className="absolute bottom-6 left-8 w-16 h-16 rounded-full bg-white/15" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                {t("readyToStart")}
              </h2>
              <p className="text-white/90 text-lg mb-8">
                {t("readyToStartDescription")}
              </p>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-bold transition-all hover:scale-105"
                style={{ backgroundColor: "white", color: "#7C3AED" }}
              >
                {t("getStartedFree")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm font-medium" style={{ color: "var(--aivo-text-muted)" }}>
        {t("copyright", { year: new Date().getFullYear().toString() })}
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="rounded-3xl p-6 transition-all duration-200 hover:shadow-[var(--shadow-hover)] hover:scale-[1.02]"
      style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: bgColor, color }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{description}</p>
    </div>
  );
}
