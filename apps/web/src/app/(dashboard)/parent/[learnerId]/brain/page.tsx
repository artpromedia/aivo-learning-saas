"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Brain, ArrowLeft, Loader2, RefreshCw, Sparkles, Eye, MessageCircle,
  Star, Zap, Shield, TrendingUp, Clock, Rocket, Activity, Lightbulb
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useBrain } from "@/hooks/useBrain";
import { useTranslations } from "next-intl";

const BRAIN_STYLES = `
  @keyframes pulse-glow {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(124,58,237,0.3)); }
    50% { transform: scale(1.04); filter: drop-shadow(0 0 24px rgba(124,58,237,0.5)); }
  }
  @keyframes orbit-dot {
    0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
    50% { transform: translate(-50%,-50%) scale(1.6); opacity: 1; }
  }
  @keyframes pop-in {
    0% { transform: scale(0.85); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes slide-up {
    0% { transform: translateY(16px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes draw-line {
    0% { stroke-dashoffset: 200; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes ring-fill {
    0% { stroke-dashoffset: var(--ring-circumference); }
    100% { stroke-dashoffset: var(--ring-offset); }
  }
  @keyframes bar-grow {
    0% { transform: scaleY(0); }
    100% { transform: scaleY(1); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes node-pulse {
    0%, 100% { r: 6; }
    50% { r: 8; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

function AnimatedBrainOrb({ confidenceScore }: { confidenceScore: number }) {
  const pct = Math.round(confidenceScore * 100);
  const circumference = 2 * Math.PI * 58;
  const offset = circumference - (confidenceScore * circumference);

  return (
    <div className="relative w-40 h-40 mx-auto shrink-0">
      <svg viewBox="0 0 140 140" className="w-full h-full" style={{ animation: "pulse-glow 4s ease-in-out infinite" }}>
        <circle cx="70" cy="70" r="62" fill="url(#brainGrad)" />
        <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
        <circle
          cx="70" cy="70" r="58"
          fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{
            "--ring-circumference": circumference,
            "--ring-offset": offset,
            animation: "ring-fill 1.5s ease-out both",
          } as React.CSSProperties}
        />
        <defs>
          <radialGradient id="brainGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </radialGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Brain size={32} className="text-white drop-shadow-lg mb-1" style={{ animation: "float 3s ease-in-out infinite" }} />
        <span className="text-white text-xs font-extrabold tracking-wider">{pct}%</span>
      </div>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{
            background: ["#2DD4BF", "#FB923C", "#38BDF8", "#F472B6", "#FBBF24", "#34D399"][i],
            top: `${50 + 48 * Math.sin((i * Math.PI * 2) / 6)}%`,
            left: `${50 + 48 * Math.cos((i * Math.PI * 2) / 6)}%`,
            transform: "translate(-50%, -50%)",
            animation: `orbit-dot ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
    </div>
  );
}

function CognitiveRadar({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores);
  const n = entries.length;
  const cx = 120, cy = 120, maxR = 90;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (i: number, val: number) => ({
    x: cx + (val / 100) * maxR * Math.cos(angleStep * i - Math.PI / 2),
    y: cy + (val / 100) * maxR * Math.sin(angleStep * i - Math.PI / 2),
  });

  const polygon = entries.map(([, v], i) => {
    const p = getPoint(i, v);
    return `${p.x},${p.y}`;
  }).join(" ");

  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 240 240" className="w-full max-w-[280px]">
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={entries.map((_, i) => {
              const p = getPoint(i, ring);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="var(--aivo-border)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
        {entries.map((_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--aivo-border)" strokeWidth="0.5" opacity="0.3" />;
        })}
        <polygon
          points={polygon}
          fill="rgba(124,58,237,0.15)"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ animation: "pop-in 0.8s ease-out both 0.3s" }}
        />
        {entries.map(([, v], i) => {
          const p = getPoint(i, v);
          const color = v >= 75 ? "#34D399" : v >= 50 ? "#FBBF24" : "#FB923C";
          return (
            <circle
              key={i}
              cx={p.x} cy={p.y} r="5"
              fill={color} stroke="white" strokeWidth="2"
              style={{ animation: `pop-in 0.4s ease-out both ${0.5 + i * 0.1}s` }}
            />
          );
        })}
        {entries.map(([key], i) => {
          const p = getPoint(i, 115);
          return (
            <text
              key={i}
              x={p.x} y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8"
              fontWeight="700"
              fill="var(--aivo-text-secondary)"
            >
              {formatLabel(key)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function NeuralConnectionMap({ connections }: { connections: { from: string; to: string; strength: number }[] }) {
  const nodes = useMemo(() => {
    const set = new Set<string>();
    connections.forEach((c) => { set.add(c.from); set.add(c.to); });
    const arr = Array.from(set);
    const cx = 160, cy = 120, r = 85;
    return arr.map((name, i) => ({
      name,
      x: cx + r * Math.cos((i * 2 * Math.PI) / arr.length - Math.PI / 2),
      y: cy + r * Math.sin((i * 2 * Math.PI) / arr.length - Math.PI / 2),
    }));
  }, [connections]);

  const getNode = (name: string) => nodes.find((n) => n.name === name)!;

  return (
    <svg viewBox="0 0 320 240" className="w-full">
      {connections.map((c, i) => {
        const from = getNode(c.from);
        const to = getNode(c.to);
        const isStrong = c.strength >= 0.7;
        return (
          <line
            key={i}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={isStrong ? "#7C3AED" : "#FB923C"}
            strokeWidth={isStrong ? 2.5 : 1.5}
            opacity={0.4 + c.strength * 0.5}
            strokeDasharray="200"
            style={{ animation: `draw-line 1s ease-out both ${i * 0.15}s` }}
          />
        );
      })}
      {nodes.map((node, i) => {
        const maxStrength = Math.max(
          ...connections.filter((c) => c.from === node.name || c.to === node.name).map((c) => c.strength),
          0.3
        );
        const color = maxStrength >= 0.7 ? "#7C3AED" : maxStrength >= 0.5 ? "#FBBF24" : "#FB923C";
        return (
          <g key={i}>
            <circle
              cx={node.x} cy={node.y} r="6"
              fill={color}
              style={{ animation: `node-pulse 2.5s ease-in-out infinite ${i * 0.3}s` }}
            />
            <circle cx={node.x} cy={node.y} r="10" fill={color} opacity="0.15" />
            <text
              x={node.x}
              y={node.y + 18}
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="var(--aivo-text)"
            >
              {node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function EngagementChart({ data }: { data: { day: string; minutes: number; focus: number }[] }) {
  const maxMin = Math.max(...data.map((d) => d.minutes));
  return (
    <div className="flex items-end gap-2 h-32 px-2">
      {data.map((d, i) => {
        const h = (d.minutes / maxMin) * 100;
        const focusColor = d.focus >= 80 ? "#34D399" : d.focus >= 70 ? "#FBBF24" : "#FB923C";
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold" style={{ color: focusColor }}>{d.focus}%</span>
            <div className="w-full rounded-t-lg relative overflow-hidden" style={{
              height: `${h}%`,
              background: `linear-gradient(180deg, #7C3AED, #A855F7)`,
              transformOrigin: "bottom",
              animation: `bar-grow 0.6s ease-out both ${i * 0.08}s`,
            }}>
              <div className="absolute inset-0 rounded-t-lg" style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s ease-in-out infinite",
              }} />
            </div>
            <span className="text-[10px] font-bold" style={{ color: "var(--aivo-text-muted)" }}>{d.day}</span>
          </div>
        );
      })}
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
        <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}, ${color}CC)`,
        }}>
          <div className="absolute inset-0" style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s ease-in-out infinite",
          }} />
        </div>
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
        border: `1px solid ${color}20`,
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

function MilestoneTimeline({ milestones }: { milestones: { id: string; title: string; date: string; icon: string }[] }) {
  const iconMap: Record<string, React.ReactNode> = {
    rocket: <Rocket size={14} />,
    eye: <Eye size={14} />,
    clock: <Clock size={14} />,
    trending: <TrendingUp size={14} />,
    brain: <Brain size={14} />,
  };
  const colors = ["#7C3AED", "#2DD4BF", "#FB923C", "#38BDF8", "#F472B6"];

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#7C3AED] via-[#2DD4BF] to-[#F472B6] rounded-full" />
      <div className="space-y-4">
        {milestones.map((m, i) => {
          const color = colors[i % colors.length];
          return (
            <div
              key={m.id}
              className="relative flex items-start gap-3"
              style={{ animation: "slide-up 0.4s ease-out both", animationDelay: `${600 + i * 120}ms` }}
            >
              <div
                className="absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ background: color, boxShadow: `0 0 0 3px ${color}25` }}
              >
                {iconMap[m.icon] ?? <Star size={14} />}
              </div>
              <div className="ml-3 pt-0.5">
                <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{m.title}</p>
                <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>
                  {new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, gradient }: { icon: React.ReactNode; title: string; gradient: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: gradient }}>
        {icon}
      </div>
      <h3 className="font-extrabold text-base" style={{ color: "var(--aivo-text)" }}>{title}</h3>
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
        <h2 className="text-xl font-extrabold text-[var(--aivo-text)] mb-2">{t("noBrainProfileYet")}</h2>
        <p className="text-[var(--aivo-text-secondary)] mb-6">{t("noBrainProfileDesc")}</p>
        <Link href={`/baseline-assessment?learnerId=${learnerId}`}>
          <Button variant="primary" leftIcon={<Brain size={16} />}>{t("startBaselineAssessment")}</Button>
        </Link>
      </div>
    );
  }

  const functioningLevelLabel: Record<string, string> = {
    STANDARD: t("standardLabel"), SUPPORTED: t("supportedLabel"),
    LOW_VERBAL: t("lowVerbalLabel"), NON_VERBAL: t("nonVerbalLabel"), PRE_SYMBOLIC: t("preSymbolicLabel"),
  };
  const levelColorMap: Record<string, string> = {
    STANDARD: "#34D399", SUPPORTED: "#FBBF24", LOW_VERBAL: "#FB923C", NON_VERBAL: "#F472B6", PRE_SYMBOLIC: "#A855F7",
  };
  const adaptationColors = ["#7C3AED", "#2DD4BF", "#FB923C", "#38BDF8", "#F472B6", "#34D399"];
  const strengthIcons = [Star, Zap, Sparkles, TrendingUp, Shield, Brain];

  const engagement = (profile as any).weeklyEngagement;
  const cognitiveScores = (profile as any).cognitiveScores;
  const neuralConnections = (profile as any).neuralConnections;
  const milestones = (profile as any).milestones;
  const avgFocus = engagement ? Math.round(engagement.reduce((a: number, d: any) => a + d.focus, 0) / engagement.length) : 0;
  const totalMin = engagement ? engagement.reduce((a: number, d: any) => a + d.minutes, 0) : 0;
  const bestDay = engagement ? engagement.reduce((best: any, d: any) => d.focus > best.focus ? d : best, engagement[0]) : null;

  return (
    <div>
      <style>{BRAIN_STYLES}</style>

      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold rounded-xl px-3 py-1.5 transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--aivo-purple-500)]"
        style={{ color: "var(--aivo-purple-500)", backgroundColor: "var(--aivo-purple-50)" }}
      >
        <ArrowLeft size={14} />
        {t("backToDashboard")}
      </Link>

      <div
        className="relative mt-4 mb-8 rounded-3xl overflow-hidden p-8 lg:p-10"
        style={{ background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 30%, #A855F7 60%, #2DD4BF 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 right-12 w-28 h-28 rounded-full bg-white/5" style={{ animation: "float 5s ease-in-out infinite" }} />
          <div className="absolute bottom-6 left-8 w-20 h-20 rounded-full bg-white/5" style={{ animation: "float 4s ease-in-out infinite 1s" }} />
          <div className="absolute top-12 left-1/3 w-12 h-12 rounded-full bg-white/3" style={{ animation: "float 6s ease-in-out infinite 0.5s" }} />
          <div className="absolute bottom-4 right-1/4 w-16 h-16 rounded-full bg-white/3" style={{ animation: "float 5s ease-in-out infinite 2s" }} />
        </div>

        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          <AnimatedBrainOrb confidenceScore={profile.confidenceScore ?? 0.82} />

          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">{t("aiGeneratedProfile")}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {t("brainProfile")}
            </h1>
            <p className="text-white/80 text-sm max-w-md">{t("howAivoLearnsDesc")}</p>
            <div className="flex flex-wrap items-center gap-3 mt-4 justify-center lg:justify-start">
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
              <span className="text-white/85 text-xs font-medium">
                {t("confidenceScore")}: {Math.round((profile.confidenceScore ?? 0.82) * 100)}%
              </span>
              <span className="text-white/60 text-xs">
                {t("modelVersion")}: {(profile as any).modelVersion}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Star size={18} />} label={t("strengths")} value={`${profile.strengths.length}`} color="#34D399" delay={0} />
        <StatCard icon={<TrendingUp size={18} />} label={t("growthAreas")} value={`${profile.challenges.length}`} color="#FB923C" delay={100} />
        <StatCard icon={<Zap size={18} />} label={t("activeAdaptations")} value={`${profile.adaptations?.length ?? 0}`} color="#7C3AED" delay={200} />
        <StatCard icon={<Shield size={18} />} label={t("sensoryPreferences")} value={`${profile.sensoryPreferences?.length ?? 0}`} color="#38BDF8" delay={300} />
      </div>

      {cognitiveScores && (
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "200ms" }}>
            <CardHeader>
              <SectionHeader icon={<Activity size={16} />} title={t("cognitiveScores")} gradient="linear-gradient(135deg, #7C3AED, #A855F7)" />
            </CardHeader>
            <CardBody>
              <CognitiveRadar scores={cognitiveScores} />
            </CardBody>
          </Card>

          {neuralConnections && (
            <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "300ms" }}>
              <CardHeader>
                <div>
                  <SectionHeader icon={<Brain size={16} />} title={t("cognitiveMap")} gradient="linear-gradient(135deg, #2DD4BF, #7C3AED)" />
                  <p className="text-xs mt-1 ml-10" style={{ color: "var(--aivo-text-muted)" }}>{t("cognitiveMapDesc")}</p>
                </div>
              </CardHeader>
              <CardBody>
                <NeuralConnectionMap connections={neuralConnections} />
                <div className="flex items-center gap-4 justify-center mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 rounded-full bg-[#7C3AED]" />
                    <span className="text-[10px] font-medium" style={{ color: "var(--aivo-text-muted)" }}>{t("strongConnection")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 rounded-full bg-[#FB923C]" />
                    <span className="text-[10px] font-medium" style={{ color: "var(--aivo-text-muted)" }}>{t("growingConnection")}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {engagement && (
        <Card className="!rounded-2xl overflow-hidden mb-4" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "350ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <SectionHeader icon={<Clock size={16} />} title={t("weeklyEngagement")} gradient="linear-gradient(135deg, #38BDF8, #2DD4BF)" />
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm font-extrabold" style={{ color: "#7C3AED" }}>{totalMin}m</div>
                  <div className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("totalMinutes")}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-extrabold" style={{ color: "#34D399" }}>{avgFocus}%</div>
                  <div className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("averageFocus")}</div>
                </div>
                {bestDay && (
                  <div className="text-center">
                    <div className="text-sm font-extrabold" style={{ color: "#FB923C" }}>{bestDay.day}</div>
                    <div className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("bestDay")}</div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <EngagementChart data={engagement} />
          </CardBody>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "400ms" }}>
          <CardHeader>
            <SectionHeader icon={<Star size={16} />} title={t("strengths")} gradient="linear-gradient(135deg, #34D399, #2DD4BF)" />
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
                    style={{ backgroundColor: `${color}10`, animation: "slide-up 0.4s ease-out both", animationDelay: `${500 + i * 80}ms` }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20`, color }}>
                      <IconComp size={14} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "450ms" }}>
          <CardHeader>
            <SectionHeader icon={<TrendingUp size={16} />} title={t("growthAreas")} gradient="linear-gradient(135deg, #FB923C, #F472B6)" />
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {profile.challenges.map((c, i) => (
                <div
                  key={c}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: "#FB923C10", animation: "slide-up 0.4s ease-out both", animationDelay: `${550 + i * 80}ms` }}
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
        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "500ms" }}>
          <CardHeader>
            <SectionHeader icon={<Eye size={16} />} title={t("learningStyle")} gradient="linear-gradient(135deg, #38BDF8, #7C3AED)" />
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{profile.learningStyle}</p>
          </CardBody>
        </Card>

        <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "550ms" }}>
          <CardHeader>
            <SectionHeader icon={<MessageCircle size={16} />} title={t("communicationStyle")} gradient="linear-gradient(135deg, #F472B6, #A855F7)" />
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{profile.communicationStyle}</p>
          </CardBody>
        </Card>
      </div>

      {profile.adaptations && profile.adaptations.length > 0 && (
        <Card className="!rounded-2xl overflow-hidden mb-4" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "600ms" }}>
          <CardHeader>
            <SectionHeader icon={<Zap size={16} />} title={t("adaptations")} gradient="linear-gradient(135deg, #7C3AED, #A855F7)" />
          </CardHeader>
          <CardBody className="space-y-4">
            {profile.adaptations.map((a: { label: string; description: string; strength: number }, i: number) => (
              <div key={a.label}>
                <AdaptationBar label={a.label} strength={a.strength} color={adaptationColors[i % adaptationColors.length]} delay={i * 150} />
                <p className="text-xs mt-1" style={{ color: "var(--aivo-text-muted)" }}>{a.description}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {profile.sensoryPreferences && profile.sensoryPreferences.length > 0 && (
          <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "650ms" }}>
            <CardHeader>
              <SectionHeader icon={<Shield size={16} />} title={t("sensoryPreferences")} gradient="linear-gradient(135deg, #38BDF8, #2DD4BF)" />
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {profile.sensoryPreferences.map((p, i) => (
                  <div
                    key={p}
                    className="flex items-center gap-2.5 p-3 rounded-xl"
                    style={{ backgroundColor: "#38BDF810", border: "1px solid #38BDF815", animation: "slide-up 0.4s ease-out both", animationDelay: `${700 + i * 80}ms` }}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#38BDF8" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{p}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {milestones && milestones.length > 0 && (
          <Card className="!rounded-2xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "700ms" }}>
            <CardHeader>
              <SectionHeader icon={<Rocket size={16} />} title={t("learningJourney")} gradient="linear-gradient(135deg, #FBBF24, #FB923C)" />
            </CardHeader>
            <CardBody>
              <MilestoneTimeline milestones={milestones} />
            </CardBody>
          </Card>
        )}
      </div>

      <Card className="!rounded-2xl overflow-hidden mb-4" style={{
        animation: "slide-up 0.5s ease-out both", animationDelay: "750ms",
        background: "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(45,212,191,0.05))",
        border: "1px solid rgba(124,58,237,0.1)",
      }}>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg, #FBBF24, #FB923C)" }}>
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm mb-1" style={{ color: "var(--aivo-text)" }}>{t("aiInsights")}</h3>
              <p className="text-xs mb-2" style={{ color: "var(--aivo-text-muted)" }}>{t("aiInsightsDesc")}</p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(124,58,237,0.06)" }}>
                  <p className="text-xs font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                    Alex learns best during <strong>Thursday sessions</strong> with 89% focus. Consider scheduling key lessons on Thursdays.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(45,212,191,0.06)" }}>
                  <p className="text-xs font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                    <strong>Visual Processing → Pattern Recognition</strong> is the strongest neural pathway (92%). Use this to scaffold weaker areas.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(251,146,60,0.06)" }}>
                  <p className="text-xs font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                    Auditory Processing remains a growth area. Consider <strong>visual-first</strong> instruction with optional audio reinforcement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between mt-6 mb-4" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "800ms" }}>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--aivo-text-muted)" }}>
          <span>{t("lastUpdated", { date: new Date(profile.updatedAt).toLocaleDateString() })}</span>
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
