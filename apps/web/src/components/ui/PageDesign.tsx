"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight, Info, X } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export const PAGE_ANIMATION_STYLES = `
  @keyframes aivo-slide-up {
    0% { transform: translateY(16px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes aivo-pop-in {
    0% { transform: scale(0.85); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes aivo-fade-in {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes aivo-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes aivo-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes aivo-bar-grow {
    0% { transform: scaleY(0); }
    100% { transform: scaleY(1); }
  }
  @keyframes aivo-modal-in {
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

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_ANIMATION_STYLES }} />
      <div>{children}</div>
    </>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03] mb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
      style={{ color: "#7C3AED", backgroundColor: "var(--aivo-purple-50)" }}
    >
      <ArrowLeft size={14} />
      {children}
    </Link>
  );
}

export function InfoModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
        style={{ animation: "aivo-modal-in 0.3s ease-out both" }}
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

export function ExpandableCard({
  icon, title, subtitle, gradient, children, infoText, linkHref, linkLabel, delay, defaultExpanded = true,
}: {
  icon: React.ReactNode; title: string; subtitle: string; gradient: string;
  children: React.ReactNode; infoText?: string; linkHref?: string; linkLabel?: string;
  delay: number; defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      {showInfo && infoText && (
        <InfoModal title={title} onClose={() => setShowInfo(false)}>
          <p>{infoText}</p>
        </InfoModal>
      )}
      <Card className="!rounded-2xl overflow-hidden" style={{ animation: "aivo-slide-up 0.5s ease-out both", animationDelay: `${delay}ms` }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: gradient }}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base" style={{ color: "var(--aivo-text)" }}>{title}</h3>
                  <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {infoText && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--aivo-purple-50)] transition-colors focus-visible:outline-2 focus-visible:outline-[#7C3AED]"
                  aria-label="Learn more"
                >
                  <Info size={14} style={{ color: "#7C3AED" }} />
                </button>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--aivo-purple-50)] transition-colors focus-visible:outline-2 focus-visible:outline-[#7C3AED]"
                aria-label={expanded ? "Collapse" : "Expand"}
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
          <CardBody style={{ animation: "aivo-fade-in 0.3s ease-out both" }}>
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

export function StatCard({ icon, label, value, color, delay, onClick }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; delay: number; onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl p-4 text-center transition-all ${onClick ? "cursor-pointer hover:scale-[1.03] active:scale-[0.98]" : ""}`}
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}20`,
        animation: "aivo-pop-in 0.5s ease-out both",
        animationDelay: `${delay}ms`,
      }}
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}BB)` }}>
        {icon}
      </div>
      <div className="text-lg font-extrabold" style={{ color }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{label}</div>
    </div>
  );
}

export function SectionHeader({ icon, title, subtitle, gradient, delay }: {
  icon: React.ReactNode; title: string; subtitle?: string; gradient: string; delay: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4" style={{ animation: "aivo-slide-up 0.5s ease-out both", animationDelay: `${delay}ms` }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: gradient }}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>{title}</h2>
        {subtitle && <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function AnimatedCard({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <div style={{ animation: "aivo-slide-up 0.5s ease-out both", animationDelay: `${delay}ms` }} className={className}>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, description, action, delay = 0 }: {
  icon: React.ReactNode; title: string; description: string;
  action?: React.ReactNode; delay?: number;
}) {
  return (
    <Card style={{ animation: "aivo-slide-up 0.5s ease-out both", animationDelay: `${delay}ms` }}>
      <CardBody className="text-center py-12">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
          backgroundColor: "var(--aivo-purple-50)",
          color: "var(--aivo-purple-500)",
          animation: "aivo-float 3s ease-in-out infinite",
        }}>
          {icon}
        </div>
        <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
          {title}
        </h3>
        <p className="font-medium mb-4" style={{ color: "var(--aivo-text-secondary)" }}>
          {description}
        </p>
        {action}
      </CardBody>
    </Card>
  );
}
