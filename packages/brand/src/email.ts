// ─── AIVO Brand for Email Templates (OONRUMAIL) ────────────────────────────────
// Import via: import { AIVO_BRAND } from "@aivo/brand/email"

export const AIVO_BRAND = {
  maxWidth: 600,
  borderRadius: 12,
  headerGradient: "linear-gradient(135deg, #915ee3, #8143e1)",
  ctaBackground: "#7c3aed",
  ctaTextColor: "#ffffff",
  ctaBorderRadius: 8,
  bodyBackground: "#f4f4f8",
  contentBackground: "#ffffff",
  fontFamily: '"Inter", -apple-system, sans-serif',
} as const;

export type AivoBrandEmail = typeof AIVO_BRAND;
