"use client";

import { cn } from "@/lib/utils";

export type TutorPersona =
  | "nova"
  | "sage"
  | "spark"
  | "chrono"
  | "pixel"
  | "harmony"
  | "echo";

const TUTOR_COLORS: Record<TutorPersona, { ring: string; bg: string; gradient: string; emoji: string }> = {
  nova: { ring: "ring-purple-400", bg: "bg-purple-100", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)", emoji: "🌟" },
  sage: { ring: "ring-teal-400", bg: "bg-teal-100", gradient: "linear-gradient(135deg, #14B8A6, #2DD4BF)", emoji: "🌿" },
  spark: { ring: "ring-amber-400", bg: "bg-amber-100", gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)", emoji: "⚡" },
  chrono: { ring: "ring-rose-400", bg: "bg-rose-100", gradient: "linear-gradient(135deg, #F43F5E, #FB7185)", emoji: "⏰" },
  pixel: { ring: "ring-emerald-400", bg: "bg-emerald-100", gradient: "linear-gradient(135deg, #10B981, #34D399)", emoji: "🎨" },
  harmony: { ring: "ring-violet-400", bg: "bg-violet-100", gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)", emoji: "🎵" },
  echo: { ring: "ring-pink-400", bg: "bg-pink-100", gradient: "linear-gradient(135deg, #EC4899, #F472B6)", emoji: "🦋" },
};

const SIZES = { sm: 48, md: 80, lg: 160, xl: 320 } as const;

interface TutorAvatarProps {
  persona: TutorPersona;
  size?: keyof typeof SIZES;
  className?: string;
  showOnlineIndicator?: boolean;
}

export function TutorAvatar({
  persona,
  size = "md",
  className,
  showOnlineIndicator = false,
}: TutorAvatarProps) {
  const px = SIZES[size];
  const colors = TUTOR_COLORS[persona] ?? TUTOR_COLORS.nova;
  const fontSize = size === "sm" ? "text-xl" : size === "md" ? "text-3xl" : size === "lg" ? "text-6xl" : "text-8xl";

  return (
    <div
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: px, height: px }}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center ring-2 ring-offset-2 w-full h-full",
          colors.ring,
        )}
        style={{ background: colors.gradient }}
      >
        <span className={fontSize}>{colors.emoji}</span>
      </div>
      {showOnlineIndicator && (
        <span
          className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
          aria-label="Online"
        />
      )}
    </div>
  );
}
