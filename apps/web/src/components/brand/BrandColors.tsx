export const BRAND_COLORS = {
  purple500: "#7C4DFF",
  purple600: "#6B3FE8",
  cta: "#7C3AED",
  teal400: "#38B2AC",
  navy: "#1A1A2E",

  gradientStart: "#915ee3",
  gradientEnd: "#8143e1",
  gradientCss: "linear-gradient(135deg, #915ee3 0%, #8143e1 100%)",

  purpleLight: "rgba(124, 58, 237, 0.1)",
  purpleMedium: "rgba(124, 58, 237, 0.3)",
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
