"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Brain, ArrowLeft, Loader2, RefreshCw, Sparkles, Eye, MessageCircle,
  Star, Zap, Shield, TrendingUp, Clock, Rocket, Activity, Lightbulb,
  ChevronDown, ChevronRight, Info, BookOpen, Target, Settings, X
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
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes modal-in {
    0% { opacity: 0; transform: scale(0.95) translateY(10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
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
    <div className="relative w-36 h-36 lg:w-40 lg:h-40 mx-auto shrink-0">
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
          style={{ "--ring-circumference": circumference, "--ring-offset": offset, animation: "ring-fill 1.5s ease-out both" } as React.CSSProperties}
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
        <Brain size={28} className="text-white drop-shadow-lg mb-1" style={{ animation: "float 3s ease-in-out infinite" }} />
        <span className="text-white text-xs font-extrabold tracking-wider">{pct}%</span>
      </div>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="absolute w-2 h-2 rounded-full" style={{
          background: ["#2DD4BF", "#FB923C", "#38BDF8", "#F472B6", "#FBBF24", "#34D399"][i],
          top: `${50 + 48 * Math.sin((i * Math.PI * 2) / 6)}%`,
          left: `${50 + 48 * Math.cos((i * Math.PI * 2) / 6)}%`,
          transform: "translate(-50%, -50%)",
          animation: `orbit-dot ${3 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.25}s`,
        }} />
      ))}
    </div>
  );
}

function InfoModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
        style={{ animation: "modal-in 0.3s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#7C3AED]"
        >
          <X size={18} style={{ color: "var(--aivo-text-muted)" }} />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <Info size={18} style={{ color: "#7C3AED" }} />
          <h3 className="font-extrabold text-lg" style={{ color: "var(--aivo-text)" }}>{title}</h3>
        </div>
        <div className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ExpandableCard({
  icon, title, subtitle, gradient, children, learnMoreText, linkHref, linkLabel, delay,
}: {
  icon: React.ReactNode; title: string; subtitle: string; gradient: string;
  children: React.ReactNode; learnMoreText?: string; linkHref?: string; linkLabel?: string; delay: number;
}) {
  const t = useTranslations("brain");
  const [expanded, setExpanded] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      {showInfo && learnMoreText && (
        <InfoModal title={title} onClose={() => setShowInfo(false)}>
          <p>{learnMoreText}</p>
        </InfoModal>
      )}
      <Card className="!rounded-3xl overflow-hidden" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: `${delay}ms` }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: gradient }}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>{title}</h3>
                  <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {learnMoreText && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--aivo-purple-50)] transition-colors focus-visible:outline-2 focus-visible:outline-[#7C3AED]"
                  aria-label={t("learnMore")}
                >
                  <Info size={14} style={{ color: "#7C3AED" }} />
                </button>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--aivo-purple-50)] transition-colors focus-visible:outline-2 focus-visible:outline-[#7C3AED]"
                aria-label={expanded ? t("collapse") : t("expand")}
              >
                <ChevronDown
                  size={16}
                  style={{ color: "var(--aivo-text-muted)", transition: "transform 0.2s", transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
                />
              </button>
            </div>
          </div>
        </CardHeader>
        {expanded && (
          <CardBody style={{ animation: "fade-in 0.3s ease-out both" }}>
            {children}
            {linkHref && linkLabel && (
              <Link
                href={linkHref}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
                style={{ color: "#7C3AED", backgroundColor: "var(--aivo-purple-50)" }}
              >
                {linkLabel}
                <ChevronRight size={12} />
              </Link>
            )}
          </CardBody>
        )}
      </Card>
    </>
  );
}

function CognitiveRadar({ scores, t }: { scores: Record<string, number>; t: (key: string) => string }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
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

  const formatLabel = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
  const getLevel = (v: number) => v >= 80 ? t("excellent") : v >= 65 ? t("good") : v >= 50 ? t("developing") : t("needsSupport");
  const getColor = (v: number) => v >= 80 ? "#34D399" : v >= 65 ? "#FBBF24" : v >= 50 ? "#FB923C" : "#EF4444";

  return (
    <div>
      <div className="flex justify-center">
        <svg viewBox="0 0 240 240" className="w-full max-w-[260px]">
          {[25, 50, 75, 100].map((ring) => (
            <polygon key={ring} points={entries.map((_, i) => { const p = getPoint(i, ring); return `${p.x},${p.y}`; }).join(" ")}
              fill="none" stroke="var(--aivo-border)" strokeWidth="0.5" opacity="0.5" />
          ))}
          {entries.map((_, i) => {
            const p = getPoint(i, 100);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--aivo-border)" strokeWidth="0.5" opacity="0.3" />;
          })}
          <polygon points={polygon} fill="rgba(124,58,237,0.12)" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round"
            style={{ animation: "pop-in 0.8s ease-out both 0.3s" }} />
          {entries.map(([, v], i) => {
            const p = getPoint(i, v);
            const color = getColor(v);
            const isActive = activeIdx === i;
            return (
              <circle key={i} cx={p.x} cy={p.y} r={isActive ? 7 : 5} fill={color} stroke="white" strokeWidth="2"
                className="cursor-pointer" onClick={() => setActiveIdx(isActive ? null : i)}
                style={{ animation: `pop-in 0.4s ease-out both ${0.5 + i * 0.1}s`, transition: "r 0.2s" }} />
            );
          })}
          {entries.map(([key], i) => {
            const p = getPoint(i, 118);
            return (
              <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="7"
                fontWeight="700" fill={activeIdx === i ? "#7C3AED" : "var(--aivo-text-secondary)"}
                className="cursor-pointer" onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                style={{ transition: "fill 0.2s" }}>
                {formatLabel(key)}
              </text>
            );
          })}
        </svg>
      </div>
      {activeIdx !== null && (
        <div className="mt-3 p-3 rounded-xl text-center" style={{ backgroundColor: `${getColor(entries[activeIdx][1])}10`, animation: "fade-in 0.2s ease-out both" }}>
          <span className="text-sm font-extrabold" style={{ color: getColor(entries[activeIdx][1]) }}>
            {formatLabel(entries[activeIdx][0])}: {entries[activeIdx][1]}%
          </span>
          <span className="mx-2 text-xs" style={{ color: "var(--aivo-text-muted)" }}>·</span>
          <span className="text-xs font-bold" style={{ color: getColor(entries[activeIdx][1]) }}>
            {getLevel(entries[activeIdx][1])}
          </span>
        </div>
      )}
      <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
        {[{ label: t("excellent"), color: "#34D399" }, { label: t("good"), color: "#FBBF24" }, { label: t("developing"), color: "#FB923C" }, { label: t("needsSupport"), color: "#EF4444" }].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] font-medium" style={{ color: "var(--aivo-text-muted)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NeuralConnectionMap({ connections, t }: { connections: { from: string; to: string; strength: number }[]; t: (key: string) => string }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const nodes = useMemo(() => {
    const set = new Set<string>();
    connections.forEach((c) => { set.add(c.from); set.add(c.to); });
    const arr = Array.from(set);
    const cx = 160, cy = 110, r = 80;
    return arr.map((name, i) => ({
      name,
      x: cx + r * Math.cos((i * 2 * Math.PI) / arr.length - Math.PI / 2),
      y: cy + r * Math.sin((i * 2 * Math.PI) / arr.length - Math.PI / 2),
    }));
  }, [connections]);

  const getNode = (name: string) => nodes.find((n) => n.name === name)!;
  const isHighlighted = (c: { from: string; to: string }) =>
    !selectedNode || c.from === selectedNode || c.to === selectedNode;

  return (
    <div>
      <svg viewBox="0 0 320 220" className="w-full">
        {connections.map((c, i) => {
          const from = getNode(c.from);
          const to = getNode(c.to);
          const isStrong = c.strength >= 0.7;
          const highlighted = isHighlighted(c);
          return (
            <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isStrong ? "#7C3AED" : "#FB923C"}
              strokeWidth={isStrong ? 2.5 : 1.5}
              opacity={highlighted ? (0.4 + c.strength * 0.5) : 0.1}
              strokeDasharray="200"
              style={{ animation: `draw-line 1s ease-out both ${i * 0.15}s`, transition: "opacity 0.3s" }} />
          );
        })}
        {nodes.map((node, i) => {
          const maxStrength = Math.max(...connections.filter((c) => c.from === node.name || c.to === node.name).map((c) => c.strength), 0.3);
          const color = maxStrength >= 0.7 ? "#7C3AED" : maxStrength >= 0.5 ? "#FBBF24" : "#FB923C";
          const isActive = selectedNode === node.name;
          const dimmed = selectedNode && !isActive && !connections.some((c) => (c.from === selectedNode && c.to === node.name) || (c.to === selectedNode && c.from === node.name));
          return (
            <g key={i} className="cursor-pointer" onClick={() => setSelectedNode(isActive ? null : node.name)}
              style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity 0.3s" }}>
              <circle cx={node.x} cy={node.y} r={isActive ? 9 : 6} fill={color}
                style={{ animation: isActive ? undefined : `node-pulse 2.5s ease-in-out infinite ${i * 0.3}s`, transition: "r 0.2s" }} />
              <circle cx={node.x} cy={node.y} r={isActive ? 14 : 10} fill={color} opacity="0.15" />
              <text x={node.x} y={node.y + 18} textAnchor="middle" fontSize="7" fontWeight="700"
                fill={isActive ? color : "var(--aivo-text)"}>
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>
      {selectedNode && (
        <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor: "rgba(124,58,237,0.05)", animation: "fade-in 0.2s ease-out both" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#7C3AED" }}>{selectedNode}</p>
          <div className="space-y-1">
            {connections.filter((c) => c.from === selectedNode || c.to === selectedNode).map((c, i) => {
              const other = c.from === selectedNode ? c.to : c.from;
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--aivo-text-secondary)" }}>→ {other}</span>
                  <span className="font-bold" style={{ color: c.strength >= 0.7 ? "#34D399" : "#FB923C" }}>
                    {Math.round(c.strength * 100)}% {c.strength >= 0.7 ? t("strongConnection") : t("growingConnection")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
      <p className="text-[10px] text-center mt-1" style={{ color: "var(--aivo-text-muted)" }}>
        {t("tapToLearnMore")}
      </p>
    </div>
  );
}

function EngagementChart({ data, t }: { data: { day: string; minutes: number; focus: number }[]; t: (key: string) => string }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const maxMin = Math.max(...data.map((d) => d.minutes));

  return (
    <div>
      <div className="flex items-end gap-2 h-32 px-2">
        {data.map((d, i) => {
          const h = (d.minutes / maxMin) * 100;
          const isActive = selectedDay === i;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 cursor-pointer" onClick={() => setSelectedDay(isActive ? null : i)}>
              <span className="text-[10px] font-bold" style={{ color: d.focus >= 80 ? "#34D399" : d.focus >= 70 ? "#FBBF24" : "#FB923C" }}>{d.focus}%</span>
              <div className="w-full rounded-t-lg relative overflow-hidden" style={{
                height: `${h}%`,
                background: isActive ? "linear-gradient(180deg, #6D28D9, #7C3AED)" : "linear-gradient(180deg, #7C3AED, #A855F7)",
                transformOrigin: "bottom",
                animation: `bar-grow 0.6s ease-out both ${i * 0.08}s`,
                outline: isActive ? "2px solid #7C3AED" : "none",
                outlineOffset: "2px",
                borderRadius: "8px 8px 0 0",
                transition: "outline 0.2s",
              }}>
                <div className="absolute inset-0 rounded-t-lg" style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s ease-in-out infinite",
                }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: isActive ? "#7C3AED" : "var(--aivo-text-muted)" }}>{d.day}</span>
            </div>
          );
        })}
      </div>
      {selectedDay !== null && (
        <div className="mt-3 p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: "rgba(124,58,237,0.05)", animation: "fade-in 0.2s ease-out both" }}>
          <div>
            <span className="text-sm font-extrabold" style={{ color: "#7C3AED" }}>{data[selectedDay].day}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-sm font-extrabold block" style={{ color: "var(--aivo-text)" }}>{data[selectedDay].minutes} {t("minutesShort")}</span>
              <span className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("minutesLearning")}</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-extrabold block" style={{ color: data[selectedDay].focus >= 80 ? "#34D399" : "#FBBF24" }}>{data[selectedDay].focus}%</span>
              <span className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("focusLabel")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdaptationBar({ label, description, strength, color, delay, onClick }: {
  label: string; description: string; strength: number; color: string; delay: number; onClick: () => void;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(strength * 100), 100 + delay);
    return () => clearTimeout(timer);
  }, [strength, delay]);

  return (
    <div className="cursor-pointer p-3 rounded-xl transition-all hover:bg-[var(--aivo-purple-50)]/50 active:scale-[0.99]" onClick={onClick}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{Math.round(strength * 100)}%</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
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
      <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{description}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay, onClick }: {
  icon: React.ReactNode; label: string; value: string; color: string; delay: number; onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-3xl p-5 text-center transition-all duration-200 hover:shadow-[var(--shadow-hover)] ${onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : "hover:scale-[1.01]"}`}
      style={{
        backgroundColor: "var(--aivo-bg-card)",
        border: "1px solid var(--aivo-border)",
        animation: "pop-in 0.5s ease-out both",
        animationDelay: `${delay}ms`,
      }}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
        style={{ backgroundColor: `${color}18`, color }}>
        {icon}
      </div>
      <div className="text-xl font-extrabold" style={{ color, fontFamily: "var(--font-display)" }}>{value}</div>
      <div className="text-xs font-medium mt-0.5" style={{ color: "var(--aivo-text-secondary)" }}>{label}</div>
    </div>
  );
}

function MilestoneTimeline({ milestones }: { milestones: { id: string; title: string; date: string; icon: string }[] }) {
  const iconMap: Record<string, React.ReactNode> = {
    rocket: <Rocket size={14} />, eye: <Eye size={14} />, clock: <Clock size={14} />,
    trending: <TrendingUp size={14} />, brain: <Brain size={14} />,
  };
  const colors = ["#7C3AED", "#2DD4BF", "#FB923C", "#38BDF8", "#F472B6"];

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#7C3AED] via-[#2DD4BF] to-[#F472B6] rounded-full" />
      <div className="space-y-4">
        {milestones.map((m, i) => {
          const color = colors[i % colors.length];
          return (
            <div key={m.id} className="relative flex items-start gap-3"
              style={{ animation: "slide-up 0.4s ease-out both", animationDelay: `${600 + i * 120}ms` }}>
              <div className="absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ background: color, boxShadow: `0 0 0 3px ${color}25` }}>
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

export default function BrainProfilePage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const { profile, isLoading, error } = useBrain(learnerId);
  const t = useTranslations("brain");
  const [adaptationDetail, setAdaptationDetail] = useState<{ label: string; description: string; strength: number } | null>(null);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>{t("retry")}</Button>
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

      {adaptationDetail && (
        <InfoModal title={adaptationDetail.label} onClose={() => setAdaptationDetail(null)}>
          <p className="mb-3">{adaptationDetail.description}</p>
          <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(124,58,237,0.05)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: "var(--aivo-text)" }}>{t("effectiveness")}</span>
              <span className="text-xs font-extrabold" style={{ color: "#7C3AED" }}>{Math.round(adaptationDetail.strength * 100)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
              <div className="h-full rounded-full" style={{ width: `${adaptationDetail.strength * 100}%`, background: "linear-gradient(90deg, #7C3AED, #A855F7)" }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--aivo-text-muted)" }}>
              {adaptationDetail.strength >= 0.7 ? t("adaptationWorking") :
               adaptationDetail.strength >= 0.5 ? t("adaptationGood") :
               t("adaptationTuning")}
            </p>
          </div>
        </InfoModal>
      )}

      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold rounded-xl px-3 py-1.5 transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--aivo-purple-500)]"
        style={{ color: "var(--aivo-purple-500)", backgroundColor: "var(--aivo-purple-50)" }}
      >
        <ArrowLeft size={14} />
        {t("backToDashboard")}
      </Link>

      <div className="relative mt-4 mb-6 rounded-3xl overflow-hidden p-6 lg:p-8"
        style={{ background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 30%, #A855F7 60%, #2DD4BF 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 right-12 w-28 h-28 rounded-full bg-white/5" style={{ animation: "float 5s ease-in-out infinite" }} />
          <div className="absolute bottom-6 left-8 w-20 h-20 rounded-full bg-white/5" style={{ animation: "float 4s ease-in-out infinite 1s" }} />
        </div>
        <div className="relative flex flex-col lg:flex-row items-center gap-6">
          <AnimatedBrainOrb confidenceScore={profile.confidenceScore ?? 0.82} />
          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-1">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-white/90 text-xs font-medium">{t("aiGeneratedProfile")}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-1.5">{t("brainProfile")}</h1>
            <p className="text-white/80 text-sm max-w-md mb-3">{t("howAivoLearnsDesc")}</p>
            <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start">
              <Link href={`/parent/${learnerId}/functioning-level`}
                className="focus-visible:outline-2 focus-visible:outline-white rounded-full">
                <Badge className="!rounded-full !px-3 !py-1.5 !text-sm !font-bold hover:scale-[1.05] transition-transform cursor-pointer" style={{
                  backgroundColor: `${levelColorMap[profile.functioningLevel] ?? "#7C3AED"}30`,
                  color: "white", border: `1px solid ${levelColorMap[profile.functioningLevel] ?? "#7C3AED"}60`,
                }}>
                  {functioningLevelLabel[profile.functioningLevel] ?? profile.functioningLevel}
                  <ChevronRight size={14} className="ml-1 inline" />
                </Badge>
              </Link>
              <span className="text-white/85 text-xs font-medium">{t("confidenceScore")}: {Math.round((profile.confidenceScore ?? 0.82) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Star size={18} />} label={t("strengths")} value={`${profile.strengths.length}`} color="#34D399" delay={0} onClick={() => scrollToSection("section-strengths")} />
        <StatCard icon={<TrendingUp size={18} />} label={t("growthAreas")} value={`${profile.challenges.length}`} color="#FB923C" delay={100} onClick={() => scrollToSection("section-growth")} />
        <StatCard icon={<Zap size={18} />} label={t("activeAdaptations")} value={`${profile.adaptations?.length ?? 0}`} color="#7C3AED" delay={200} onClick={() => scrollToSection("section-adaptations")} />
        <StatCard icon={<Shield size={18} />} label={t("sensoryPreferences")} value={`${profile.sensoryPreferences?.length ?? 0}`} color="#38BDF8" delay={300} onClick={() => scrollToSection("section-sensory")} />
      </div>

      {cognitiveScores && (
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <ExpandableCard icon={<Activity size={16} />} title={t("cognitiveScores")} subtitle={t("cognitiveScoresSubtitle")}
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)" delay={200} learnMoreText={t("learnMoreCognitive")}
            linkHref={`/parent/${learnerId}/gradebook`} linkLabel={t("viewGradebook")}>
            <CognitiveRadar scores={cognitiveScores} t={t} />
          </ExpandableCard>

          {neuralConnections && (
            <ExpandableCard icon={<Brain size={16} />} title={t("cognitiveMap")} subtitle={t("cognitiveMapSubtitle")}
              gradient="linear-gradient(135deg, #2DD4BF, #7C3AED)" delay={300}>
              <NeuralConnectionMap connections={neuralConnections} t={t} />
            </ExpandableCard>
          )}
        </div>
      )}

      {engagement && (
        <ExpandableCard icon={<Clock size={16} />} title={t("weeklyEngagement")} subtitle={t("engagementSubtitle")}
          gradient="linear-gradient(135deg, #38BDF8, #2DD4BF)" delay={350} learnMoreText={t("learnMoreEngagement")}>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="px-3 py-2 rounded-xl" style={{ backgroundColor: "#7C3AED10" }}>
              <div className="text-sm font-extrabold" style={{ color: "#7C3AED" }}>{totalMin} {t("minutesShort")}</div>
              <div className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("totalMinutes")}</div>
            </div>
            <div className="px-3 py-2 rounded-xl" style={{ backgroundColor: "#34D39910" }}>
              <div className="text-sm font-extrabold" style={{ color: "#34D399" }}>{avgFocus}%</div>
              <div className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("averageFocus")}</div>
            </div>
            {bestDay && (
              <div className="px-3 py-2 rounded-xl" style={{ backgroundColor: "#FB923C10" }}>
                <div className="text-sm font-extrabold" style={{ color: "#FB923C" }}>{bestDay.day}</div>
                <div className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("bestDay")}</div>
              </div>
            )}
          </div>
          <EngagementChart data={engagement} t={t} />
          <p className="text-[10px] text-center mt-2" style={{ color: "var(--aivo-text-muted)" }}>{t("tapToLearnMore")}</p>
        </ExpandableCard>
      )}

      <div id="section-strengths" className="scroll-mt-4" />
      <div className="grid lg:grid-cols-2 gap-4 mb-4 mt-4">
        <ExpandableCard icon={<Star size={16} />} title={t("strengths")} subtitle={t("strengthsSubtitle")}
          gradient="linear-gradient(135deg, #34D399, #2DD4BF)" delay={400} learnMoreText={t("learnMoreStrengths")}>
          <div className="space-y-2">
            {profile.strengths.map((s, i) => {
              const IconComp = strengthIcons[i % strengthIcons.length];
              const color = ["#34D399", "#2DD4BF", "#38BDF8", "#7C3AED", "#FBBF24", "#F472B6"][i % 6];
              return (
                <div key={s} className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:scale-[1.02] cursor-default"
                  style={{ backgroundColor: `${color}10`, animation: "slide-up 0.4s ease-out both", animationDelay: `${500 + i * 80}ms` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20`, color }}>
                    <IconComp size={14} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{s}</span>
                </div>
              );
            })}
          </div>
        </ExpandableCard>

        <div id="section-growth" className="scroll-mt-4">
          <ExpandableCard icon={<TrendingUp size={16} />} title={t("growthAreas")} subtitle={t("growthAreasSubtitle")}
            gradient="linear-gradient(135deg, #FB923C, #F472B6)" delay={450} learnMoreText={t("learnMoreGrowth")}
            linkHref={`/parent/${learnerId}/recommendations`} linkLabel={t("viewRecommendations")}>
            <div className="space-y-2">
              {profile.challenges.map((c, i) => (
                <div key={c} className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:scale-[1.02] cursor-default"
                  style={{ backgroundColor: "#FB923C10", animation: "slide-up 0.4s ease-out both", animationDelay: `${550 + i * 80}ms` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#FB923C20", color: "#FB923C" }}>
                    <TrendingUp size={14} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{c}</span>
                </div>
              ))}
            </div>
          </ExpandableCard>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ExpandableCard icon={<Eye size={16} />} title={t("learningStyle")} subtitle={t("learningStyleSubtitle")}
          gradient="linear-gradient(135deg, #38BDF8, #7C3AED)" delay={500}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{profile.learningStyle}</p>
        </ExpandableCard>

        <ExpandableCard icon={<MessageCircle size={16} />} title={t("communicationStyle")} subtitle={t("communicationSubtitle")}
          gradient="linear-gradient(135deg, #F472B6, #A855F7)" delay={550}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--aivo-text-secondary)" }}>{profile.communicationStyle}</p>
        </ExpandableCard>
      </div>

      <div id="section-adaptations" className="scroll-mt-4" />
      {profile.adaptations && profile.adaptations.length > 0 && (
        <ExpandableCard icon={<Zap size={16} />} title={t("adaptations")} subtitle={t("adaptationsSubtitle")}
          gradient="linear-gradient(135deg, #7C3AED, #A855F7)" delay={600} learnMoreText={t("learnMoreAdaptations")}
          linkHref={`/parent/${learnerId}/settings`} linkLabel={t("viewSettings")}>
          <div className="space-y-1">
            {profile.adaptations.map((a: { label: string; description: string; strength: number }, i: number) => (
              <AdaptationBar key={a.label} label={a.label} description={a.description}
                strength={a.strength} color={adaptationColors[i % adaptationColors.length]}
                delay={i * 150} onClick={() => setAdaptationDetail(a)} />
            ))}
          </div>
        </ExpandableCard>
      )}

      <div id="section-sensory" className="scroll-mt-4 mt-4" />
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {profile.sensoryPreferences && profile.sensoryPreferences.length > 0 && (
          <ExpandableCard icon={<Shield size={16} />} title={t("sensoryPreferences")} subtitle={t("sensorySubtitle")}
            gradient="linear-gradient(135deg, #38BDF8, #2DD4BF)" delay={650} learnMoreText={t("learnMoreSensory")}>
            <div className="space-y-2">
              {profile.sensoryPreferences.map((p, i) => (
                <div key={p} className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ backgroundColor: "#38BDF810", border: "1px solid #38BDF815", animation: "slide-up 0.4s ease-out both", animationDelay: `${700 + i * 80}ms` }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#38BDF8" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{p}</span>
                </div>
              ))}
            </div>
          </ExpandableCard>
        )}

        {milestones && milestones.length > 0 && (
          <ExpandableCard icon={<Rocket size={16} />} title={t("learningJourney")} subtitle={t("journeySubtitle")}
            gradient="linear-gradient(135deg, #FBBF24, #FB923C)" delay={700}>
            <MilestoneTimeline milestones={milestones} />
          </ExpandableCard>
        )}
      </div>

      <Card className="!rounded-3xl overflow-hidden mb-4" style={{
        animation: "slide-up 0.5s ease-out both", animationDelay: "750ms",
        background: "linear-gradient(135deg, rgba(124,58,237,0.04), rgba(45,212,191,0.04))",
        border: "1px solid rgba(124,58,237,0.1)",
      }}>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg, #FBBF24, #FB923C)" }}>
              <Lightbulb size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-sm mb-0.5" style={{ color: "var(--aivo-text)" }}>{t("aiInsights")}</h3>
              <p className="text-xs mb-3" style={{ color: "var(--aivo-text-muted)" }}>{t("insightsSubtitle")}</p>
              <div className="space-y-2">
                {[
                  { text: t.rich("insightBestDay", { strong: (chunks) => <strong>{chunks}</strong> }), bg: "rgba(124,58,237,0.06)" },
                  { text: t.rich("insightStrongestPathway", { strong: (chunks) => <strong>{chunks}</strong> }), bg: "rgba(45,212,191,0.06)" },
                  { text: t.rich("insightGrowthArea", { strong: (chunks) => <strong>{chunks}</strong> }), bg: "rgba(251,146,60,0.06)" },
                ].map((insight, i) => (
                  <div key={i} className="p-2.5 rounded-lg" style={{ backgroundColor: insight.bg }}>
                    <p className="text-xs font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{insight.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link href={`/parent/${learnerId}/recommendations`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
                  style={{ color: "#7C3AED", backgroundColor: "var(--aivo-purple-50)" }}>
                  <Target size={12} /> {t("viewRecommendations")} <ChevronRight size={12} />
                </Link>
                <Link href={`/parent/${learnerId}/iep`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34D399]"
                  style={{ color: "#34D399", backgroundColor: "#34D39910" }}>
                  <BookOpen size={12} /> {t("viewIep")} <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between mt-4 mb-4" style={{ animation: "slide-up 0.5s ease-out both", animationDelay: "800ms" }}>
        <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>
          {t("lastUpdated", { date: new Date(profile.updatedAt).toLocaleDateString() })}
        </span>
        <Link href={`/parent/${learnerId}/functioning-level`}
          className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
          style={{ color: "#7C3AED", backgroundColor: "var(--aivo-purple-50)" }}>
          {t("viewFunctioningLevel")} <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
