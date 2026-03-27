// ─── AIVO Brand Design Tokens ───────────────────────────────────────────────────
// Single source of truth for all design values across web, email, and Flutter.

export const AIVO_BRAND = {
  // ─── Colors ─────────────────────────────────────────────────────────────────
  colors: {
    purple: {
      50: "#F5F0FF",
      100: "#EDE5FF",
      200: "#D4C4FF",
      300: "#B89EFF",
      400: "#9B75FF",
      500: "#7C4DFF",
      600: "#6B3FE8",
      700: "#5530CC",
      800: "#4024A3",
      900: "#2C1875",
    },
    teal: {
      50: "#E6FFFA",
      100: "#B2F5EA",
      200: "#81E6D9",
      300: "#4FD1C5",
      400: "#38B2AC",
      500: "#319795",
      600: "#2C7A7B",
      700: "#285E61",
      800: "#234E52",
      900: "#1D4044",
    },
    navy: {
      50: "#E8EAF6",
      100: "#C5CAE9",
      200: "#9FA8DA",
      300: "#7986CB",
      400: "#5C6BC0",
      500: "#3F51B5",
      600: "#3949AB",
      700: "#303F9F",
      800: "#283593",
      900: "#1A237E",
    },
    success: {
      light: "#A5D6A7",
      DEFAULT: "#4CAF50",
      dark: "#2E7D32",
    },
    warning: {
      light: "#FFE082",
      DEFAULT: "#FFC107",
      dark: "#F57F17",
    },
    error: {
      light: "#EF9A9A",
      DEFAULT: "#F44336",
      dark: "#C62828",
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F8F9FA",
      tertiary: "#F1F3F5",
      dark: "#1A1A2E",
    },
    text: {
      primary: "#212529",
      secondary: "#6C757D",
      muted: "#ADB5BD",
      inverse: "#FFFFFF",
    },
  },

  // ─── Typography ─────────────────────────────────────────────────────────────
  typography: {
    fontFamily: {
      display: "'Nunito', 'Segoe UI', sans-serif",
      body: "'Inter', 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: "0.75rem",     // 12px
      sm: "0.875rem",    // 14px
      base: "1rem",      // 16px
      lg: "1.125rem",    // 18px
      xl: "1.25rem",     // 20px
      "2xl": "1.5rem",   // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem",  // 36px
      "5xl": "3rem",     // 48px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
  },

  // ─── Spacing ────────────────────────────────────────────────────────────────
  spacing: {
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
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    32: "8rem",
  },

  // ─── Border Radius ──────────────────────────────────────────────────────────
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    DEFAULT: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    full: "9999px",
  },

  // ─── Shadows ────────────────────────────────────────────────────────────────
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },

  // ─── Animation ──────────────────────────────────────────────────────────────
  animation: {
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
  },

  // ─── Email-specific ─────────────────────────────────────────────────────────
  email: {
    maxWidth: "600px",
    fontFamily: "'Inter', 'Segoe UI', Arial, Helvetica, sans-serif",
    headerBg: "#7C4DFF",
    headerText: "#FFFFFF",
    footerBg: "#F8F9FA",
    footerText: "#6C757D",
    buttonBg: "#7C4DFF",
    buttonText: "#FFFFFF",
    buttonRadius: "8px",
    linkColor: "#7C4DFF",
    dividerColor: "#E9ECEF",
  },
} as const;

export type AivoBrand = typeof AIVO_BRAND;
