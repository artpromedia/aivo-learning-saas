export const BRAND_COLORS = {
  purple500: "#7C3AED",
  purple600: "#6D28D9",
  cta: "#7C3AED",
  ctaHover: "#6D28D9",
  coral: "#FF6B6B",
  teal: "#2DD4BF",
  sunny: "#FBBF24",
  sky: "#38BDF8",
  mint: "#34D399",
  pink: "#F472B6",
  orange: "#FB923C",

  gradientStart: "#7C3AED",
  gradientMid: "#A855F7",
  gradientEnd: "#2DD4BF",
  gradientCss: "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #2DD4BF 100%)",
  gradientWarm: "linear-gradient(135deg, #7C3AED 0%, #F472B6 50%, #FB923C 100%)",
  gradientCool: "linear-gradient(135deg, #38BDF8 0%, #7C3AED 50%, #A855F7 100%)",

  purpleLight: "rgba(124, 58, 237, 0.1)",
  purpleMedium: "rgba(124, 58, 237, 0.3)",
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
