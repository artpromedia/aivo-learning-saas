// ─── AIVO Brand Design Tokens ───────────────────────────────────────────────────
// Single source of truth for all design values across web, email, and Flutter.
// Colors match PRD Section 7C + original globals.css exactly.

export const AIVO_COLORS = {
  purple: {
    50: "#f5f0ff",
    100: "#ede5ff",
    200: "#d9c7ff",
    300: "#b99aff",
    400: "#9666e3",
    500: "#7c3aed",
    600: "#6d28d9",
    700: "#5b21b6",
    800: "#4c1d95",
    900: "#3b0d7e",
  },
  teal: {
    50: "#effcfd",
    100: "#d5f7fa",
    200: "#a5eef4",
    300: "#67e0eb",
    400: "#35cbda",
    500: "#14b8c8",
    600: "#0d95a8",
    700: "#0e7a8a",
    800: "#126271",
    900: "#14505f",
  },
  navy: {
    50: "#eef0f6",
    100: "#d4d8e8",
    200: "#a8b0d0",
    300: "#7c88b8",
    400: "#5060a0",
    500: "#2d3a6e",
    600: "#252f5a",
    700: "#1d2448",
    800: "#161a36",
    900: "#0f1024",
  },
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  white: "#FFFFFF",
} as const;

export const AIVO_TYPOGRAPHY = {
  fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
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
  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;

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
} as const;

export const AIVO_BORDER_RADIUS = {
  none: "0",
  sm: "0.25rem",
  DEFAULT: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  full: "9999px",
} as const;

export const AIVO_SHADOWS = {
  card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  cardHover: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  nav: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
  navScrolled: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

export const AIVO_GRADIENTS = {
  purple: "linear-gradient(135deg, #7c3aed 0%, #9666e3 50%, #b99aff 100%)",
  teal: "linear-gradient(135deg, #14b8c8 0%, #35cbda 50%, #67e0eb 100%)",
  hero: "linear-gradient(135deg, #7c3aed 0%, #14b8c8 100%)",
  purpleHeader: "linear-gradient(135deg, #915ee3, #8143e1)",
} as const;

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

export type AivoColors = typeof AIVO_COLORS;
export type AivoTypography = typeof AIVO_TYPOGRAPHY;
export type AivoShadows = typeof AIVO_SHADOWS;
export type AivoGradients = typeof AIVO_GRADIENTS;
