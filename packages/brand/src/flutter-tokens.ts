// ─── Flutter Design Tokens ──────────────────────────────────────────────────────
// JSON-serializable tokens for Flutter/Dart consumption.
// Import via: import { FLUTTER_TOKENS } from "@aivo/brand/flutter"
// Usage: Generate a dart file or load at build time.

import { AIVO_BRAND } from "./tokens.js";

function hexToArgb(hex: string): string {
  const clean = hex.replace("#", "");
  return `0xFF${clean}`;
}

function flattenColors(colors: Record<string, string | Record<string, string>>, prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      result[`${prefix}${key}`] = hexToArgb(value);
    } else {
      for (const [shade, hex] of Object.entries(value)) {
        result[`${prefix}${key}${shade === "DEFAULT" ? "" : shade}`] = hexToArgb(hex);
      }
    }
  }
  return result;
}

export const FLUTTER_TOKENS = {
  colors: flattenColors(AIVO_BRAND.colors as Record<string, string | Record<string, string>>, ""),
  typography: {
    fontFamilyDisplay: "Nunito",
    fontFamilyBody: "Inter",
    fontFamilyMono: "JetBrains Mono",
    fontSizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
      xxxxl: 36,
      xxxxxl: 48,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
} as const;

export type FlutterTokens = typeof FLUTTER_TOKENS;
