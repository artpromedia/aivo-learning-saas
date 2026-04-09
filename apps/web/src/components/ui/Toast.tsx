"use client";

import { Toaster as SonnerToaster } from "sonner";

export interface AivoToasterProps {
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
}

function AivoToaster({ position = "bottom-right" }: AivoToasterProps) {
  return (
    <SonnerToaster
      position={position}
      toastOptions={{
        style: {
          borderRadius: "1rem",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
        },
        classNames: {
          toast: "border border-[#E8DDF0] dark:border-[#3D2D5C] shadow-[var(--shadow-playful)]",
          title: "text-sm font-bold",
          description: "text-sm text-[#6B5B7B] dark:text-[#B8A5D0]",
          success: "!bg-[#D1FAE5] !text-[#065F46] dark:!bg-[#065F46]/30 dark:!text-[#34D399]",
          error: "!bg-[#FFE0E0] !text-[#991B1B] dark:!bg-[#991B1B]/30 dark:!text-[#F87171]",
          info: "!bg-[#F0E6FF] !text-[#7C3AED] dark:!bg-[#3D2D5C] dark:!text-[#C9A6FF]",
          warning: "!bg-[#FEF3C7] !text-[#92400E] dark:!bg-[#92400E]/30 dark:!text-[#FBBF24]",
        },
      }}
      richColors
      closeButton
    />
  );
}

export { AivoToaster };
