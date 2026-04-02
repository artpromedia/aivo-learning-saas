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

const TUTOR_COLORS: Record<TutorPersona, { ring: string; bg: string }> = {
  nova: { ring: "ring-purple-400", bg: "bg-purple-100" },
  sage: { ring: "ring-teal-400", bg: "bg-teal-100" },
  spark: { ring: "ring-amber-400", bg: "bg-amber-100" },
  chrono: { ring: "ring-rose-400", bg: "bg-rose-100" },
  pixel: { ring: "ring-emerald-400", bg: "bg-emerald-100" },
  harmony: { ring: "ring-violet-400", bg: "bg-violet-100" },
  echo: { ring: "ring-pink-400", bg: "bg-pink-100" },
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
  const colors = TUTOR_COLORS[persona];
  const src = `/assets/tutors/optimized/${persona}-avatar.webp`;

  return (
    <div
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: px, height: px }}
    >
      <Image
        src={src}
        alt={persona}
        width={px}
        height={px}
        className={cn(
          "rounded-full object-cover ring-2 ring-offset-2",
          colors.ring,
          colors.bg,
        )}
      />
      {showOnlineIndicator && (
        <span
          className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
          aria-label="Online"
        />
      )}
    </div>
  );
}
