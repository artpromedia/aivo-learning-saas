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
          borderRadius: "0.75rem",
          fontFamily: "inherit",
        },
        classNames: {
          toast: "border border-gray-200 dark:border-gray-700 shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm text-gray-600 dark:text-gray-400",
          success: "!bg-green-50 !text-green-900 dark:!bg-green-900/30 dark:!text-green-300",
          error: "!bg-red-50 !text-red-900 dark:!bg-red-900/30 dark:!text-red-300",
          info: "!bg-[#7C3AED]/5 !text-[#7C3AED] dark:!bg-[#7C4DFF]/20 dark:!text-[#7C4DFF]",
          warning: "!bg-yellow-50 !text-yellow-900 dark:!bg-yellow-900/30 dark:!text-yellow-300",
        },
      }}
      richColors
      closeButton
    />
  );
}

export { AivoToaster };
