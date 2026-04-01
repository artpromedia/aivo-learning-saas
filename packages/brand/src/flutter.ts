// ─── Flutter/Dart Design Tokens ─────────────────────────────────────────────────
// Import via: import { AIVO_FLUTTER_COLORS } from "@aivo/brand/flutter"
// Use to generate AivoColors.dart or load at build time.

import { AIVO_COLORS } from "./tokens.js";

function hexToArgb(hex: string): string {
  const clean = hex.replace("#", "").toUpperCase();
  return `0xFF${clean}`;
}

function buildPaletteMap(palette: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [shade, hex] of Object.entries(palette)) {
    result[shade] = hexToArgb(hex);
  }
  return result;
}

export const AIVO_FLUTTER_COLORS = {
  purple: buildPaletteMap(AIVO_COLORS.purple as unknown as Record<string, string>),
  teal: buildPaletteMap(AIVO_COLORS.teal as unknown as Record<string, string>),
  navy: buildPaletteMap(AIVO_COLORS.navy as unknown as Record<string, string>),
  gray: buildPaletteMap(AIVO_COLORS.gray as unknown as Record<string, string>),
  success: hexToArgb(AIVO_COLORS.success),
  warning: hexToArgb(AIVO_COLORS.warning),
  error: hexToArgb(AIVO_COLORS.error),
  white: hexToArgb(AIVO_COLORS.white),
} as const;

export const AIVO_FLUTTER_TYPOGRAPHY = {
  fontFamily: "Inter",
  fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  fontSizes: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, xxl: 24, xxxl: 30, xxxxl: 36 },
} as const;

export const AIVO_FLUTTER_SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
} as const;

export const AIVO_FLUTTER_BORDER_RADIUS = {
  sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, full: 9999,
} as const;

export type AivoFlutterColors = typeof AIVO_FLUTTER_COLORS;
