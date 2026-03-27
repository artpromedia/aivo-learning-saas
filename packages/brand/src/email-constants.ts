// ─── Email Constants ────────────────────────────────────────────────────────────
// Subset of AIVO_BRAND specifically for email templates (React Email, MJML, etc.)
// Import via: import { EMAIL_CONSTANTS } from "@aivo/brand/email"

import { AIVO_BRAND } from "./tokens.js";

export const EMAIL_CONSTANTS = {
  ...AIVO_BRAND.email,
  colors: {
    primary: AIVO_BRAND.colors.purple[500],
    primaryDark: AIVO_BRAND.colors.purple[700],
    secondary: AIVO_BRAND.colors.teal[500],
    success: AIVO_BRAND.colors.success.DEFAULT,
    warning: AIVO_BRAND.colors.warning.DEFAULT,
    error: AIVO_BRAND.colors.error.DEFAULT,
    textPrimary: AIVO_BRAND.colors.text.primary,
    textSecondary: AIVO_BRAND.colors.text.secondary,
    textMuted: AIVO_BRAND.colors.text.muted,
    background: AIVO_BRAND.colors.background.primary,
    backgroundAlt: AIVO_BRAND.colors.background.secondary,
  },
  typography: {
    fontFamily: AIVO_BRAND.email.fontFamily,
    headingSize: "24px",
    subheadingSize: "18px",
    bodySize: "16px",
    smallSize: "14px",
    captionSize: "12px",
  },
} as const;

export type EmailConstants = typeof EMAIL_CONSTANTS;
