// ─── Tailwind v4 Preset ─────────────────────────────────────────────────────────
// Use via: import { aivoPreset } from "@aivo/brand/tailwind"
// In tailwind.config: presets: [aivoPreset]

import { AIVO_BRAND } from "./tokens.js";

export const aivoPreset = {
  theme: {
    extend: {
      colors: {
        purple: AIVO_BRAND.colors.purple,
        teal: AIVO_BRAND.colors.teal,
        navy: AIVO_BRAND.colors.navy,
        success: AIVO_BRAND.colors.success,
        warning: AIVO_BRAND.colors.warning,
        error: AIVO_BRAND.colors.error,
        background: AIVO_BRAND.colors.background,
        foreground: AIVO_BRAND.colors.text,
      },
      fontFamily: {
        display: [AIVO_BRAND.typography.fontFamily.display],
        body: [AIVO_BRAND.typography.fontFamily.body],
        mono: [AIVO_BRAND.typography.fontFamily.mono],
      },
      fontSize: AIVO_BRAND.typography.fontSize,
      fontWeight: AIVO_BRAND.typography.fontWeight,
      lineHeight: AIVO_BRAND.typography.lineHeight,
      spacing: AIVO_BRAND.spacing,
      borderRadius: AIVO_BRAND.borderRadius,
      boxShadow: AIVO_BRAND.shadow,
      transitionDuration: AIVO_BRAND.animation.duration,
      transitionTimingFunction: AIVO_BRAND.animation.easing,
    },
  },
} as const;
