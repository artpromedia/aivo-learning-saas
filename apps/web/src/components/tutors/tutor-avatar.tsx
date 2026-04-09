"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type TutorPersona =
  | "nova"
  | "sage"
  | "spark"
  | "chrono"
  | "pixel"
  | "harmony"
  | "echo";

const TUTOR_CONFIG: Record<TutorPersona, { ring: string; gradient: string; image: string; name: string }> = {
  nova: { ring: "ring-purple-400", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)", image: "/assets/tutors/nova-hero.webp", name: "Nova" },
  sage: { ring: "ring-teal-400", gradient: "linear-gradient(135deg, #14B8A6, #2DD4BF)", image: "/assets/tutors/sage-hero.webp", name: "Sage" },
  spark: { ring: "ring-amber-400", gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)", image: "/assets/tutors/spark-hero.webp", name: "Spark" },
  chrono: { ring: "ring-rose-400", gradient: "linear-gradient(135deg, #F43F5E, #FB7185)", image: "/assets/tutors/chrono-hero.webp", name: "Chrono" },
  pixel: { ring: "ring-emerald-400", gradient: "linear-gradient(135deg, #10B981, #34D399)", image: "/assets/tutors/pixel-hero.webp", name: "Pixel" },
  harmony: { ring: "ring-violet-400", gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)", image: "/assets/tutors/harmony-hero.webp", name: "Harmony" },
  echo: { ring: "ring-pink-400", gradient: "linear-gradient(135deg, #EC4899, #F472B6)", image: "/assets/tutors/echo-hero.webp", name: "Echo" },
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
  const config = TUTOR_CONFIG[persona] ?? TUTOR_CONFIG.nova;
  const onlineDotSize = size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: px, height: px }}
    >
      <div
        className={cn(
          "rounded-full overflow-hidden ring-2 ring-offset-2 w-full h-full",
          config.ring,
        )}
        style={{ background: config.gradient }}
      >
        <Image
          src={config.image}
          alt={config.name}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          priority={size === "lg" || size === "xl"}
        />
      </div>
      {showOnlineIndicator && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white",
            onlineDotSize,
          )}
          aria-label="Online"
        />
      )}
    </div>
  );
}
