"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function HeroBackground({ className }: { className?: string }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
      data-testid="hero-background"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed] via-[#5b21b6] to-[#0d95a8]" />

      {/* Animated mesh layers */}
      <div
        className={cn(
          "absolute inset-0",
          !reducedMotion && "animate-[meshMove1_12s_ease-in-out_infinite]"
        )}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(124, 58, 237, 0.6), transparent)",
          willChange: "transform",
        }}
      />
      <div
        className={cn(
          "absolute inset-0",
          !reducedMotion && "animate-[meshMove2_15s_ease-in-out_infinite]"
        )}
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 70% 60%, rgba(13, 149, 168, 0.5), transparent)",
          willChange: "transform",
        }}
      />
      <div
        className={cn(
          "absolute inset-0",
          !reducedMotion && "animate-[meshMove3_18s_ease-in-out_infinite]"
        )}
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(20, 184, 200, 0.3), transparent)",
          willChange: "transform",
        }}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/20" />

      <style jsx>{`
        @keyframes meshMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, -3%) scale(1.05); }
          66% { transform: translate(-3%, 5%) scale(0.95); }
        }
        @keyframes meshMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-4%, 4%) scale(1.03); }
          66% { transform: translate(6%, -2%) scale(0.97); }
        }
        @keyframes meshMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(3%, 3%) scale(1.1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
