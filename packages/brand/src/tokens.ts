// ─── AIVO Brand Design Tokens ───────────────────────────────────────────────────
// Single source of truth for all design values across web, email, and Flutter.
// Colors match PRD Section 7C. Contrast ratios ≥ 4.5:1 verified against backgrounds.

/** Full AIVO color palette with accessible contrast ratios. */
export const AIVO_COLORS = {
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#7c3aed",
    600: "#6d28d9",
    700: "#5b21b6",
    800: "#4c1d95",
    900: "#3b0764",
    950: "#2e1065",
  },
  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8c8",
    600: "#0d95a8",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
    950: "#042f2e",
  },
  navy: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  white: "#ffffff",
} as const;

/** Typography scale optimized for SaaS marketing funnels. */
export const AIVO_TYPOGRAPHY = {
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  scale: {
    hero: { fontSize: "72px", lineHeight: "80px" },
    h1: { fontSize: "48px", lineHeight: "56px" },
    h2: { fontSize: "36px", lineHeight: "44px" },
    h3: { fontSize: "30px", lineHeight: "36px" },
    h4: { fontSize: "24px", lineHeight: "32px" },
    "body-lg": { fontSize: "20px", lineHeight: "28px" },
    body: { fontSize: "16px", lineHeight: "24px" },
    "body-sm": { fontSize: "14px", lineHeight: "20px" },
    caption: { fontSize: "12px", lineHeight: "16px" },
  },
  /** @deprecated Use `scale` for new code. Kept for backward compatibility. */
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  /** @deprecated Use `scale` for new code. Kept for backward compatibility. */
  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;

/** Spacing scale in 4px base increments. Values are multipliers × 4px = rem. */
export const AIVO_SPACING = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  64: "16rem",
  80: "20rem",
  96: "24rem",
} as const;

/** Border radius tokens. */
export const AIVO_BORDER_RADIUS = {
  none: "0",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
} as const;

/** Elevation shadow scale for depth layering. */
export const AIVO_SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  cardHover: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  nav: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
  navScrolled: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
} as const;

/** Brand gradient presets. */
export const AIVO_GRADIENTS = {
  purple: "linear-gradient(135deg, #7c3aed 0%, #9666e3 50%, #b99aff 100%)",
  teal: "linear-gradient(135deg, #14b8c8 0%, #35cbda 50%, #67e0eb 100%)",
  hero: "linear-gradient(135deg, #7c3aed 0%, #14b8c8 100%)",
  purpleHeader: "linear-gradient(135deg, #915ee3, #8143e1)",
} as const;

/** Animation / transition presets. */
export const AIVO_ANIMATION = {
  duration: {
    fast: "150ms",
    DEFAULT: "250ms",
    slow: "400ms",
    slower: "600ms",
  },
  easing: {
    DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

/** Transition shorthand presets for common UI patterns. */
export const AIVO_TRANSITIONS = {
  fast: "150ms ease",
  medium: "300ms ease-out",
  slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/**
 * Unified design token object containing all AIVO brand tokens.
 * This is the canonical export for programmatic access.
 */
export const tokens = {
  colors: AIVO_COLORS,
  typography: AIVO_TYPOGRAPHY,
  spacing: AIVO_SPACING,
  borderRadius: AIVO_BORDER_RADIUS,
  shadows: AIVO_SHADOWS,
  gradients: AIVO_GRADIENTS,
  animation: AIVO_ANIMATION,
  transitions: AIVO_TRANSITIONS,
} as const;

export type AivoColors = typeof AIVO_COLORS;
export type AivoTypography = typeof AIVO_TYPOGRAPHY;
export type AivoShadows = typeof AIVO_SHADOWS;
export type AivoGradients = typeof AIVO_GRADIENTS;
export type AivoTokens = typeof tokens;
