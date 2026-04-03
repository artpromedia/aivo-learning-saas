/* ─── Hero Slide Image Data ─────────────────────────────────────── */

export interface HeroSlideImage {
  /** Unique identifier for the slide image */
  id: string;
  /** Primary WebP source path */
  src: string;
  /** Responsive srcSet string (WebP) — populated by optimize-hero-images script */
  srcSet: string;
  /** Tiny base64 blur placeholder — populated by optimize-hero-images script */
  blurDataURL: string;
  /** Descriptive alt text */
  alt: string;
  /** Original width in px */
  width: number;
  /** Original height in px */
  height: number;
  /** Accent color for radial glow and UI elements */
  accentColor: string;
  /** Glow / lighter accent for highlights */
  glowColor: string;
  /** Responsive sizes attribute */
  sizes: string;
}

/**
 * Image configurations for hero slides 1 and 2 (background photo slides).
 *
 * All 6 images are used across 9 hero slides. Slides 3, 5, and 9 use
 * component mockups (BrainCloneMockup, TutorsMockup, DashboardMockup)
 * alongside these background images.
 *
 * blurDataURL values are empty strings until populated by the build-time
 * optimization script: `pnpm optimize:hero`
 */
export const HERO_SLIDE_IMAGES: HeroSlideImage[] = [
  // ── Slide 1: "ai-learning" ───────────────────────────────────
  {
    id: "arab-boy-chromebook",
    src: "/hero/arab-boy-chromebook.webp",
    srcSet: "",
    blurDataURL: "", // auto-populated by pnpm optimize:hero
    alt: "Young boy engaged in AI-powered learning on a Chromebook laptop",
    width: 2752,
    height: 1536,
    accentColor: "#7C3AED",
    glowColor: "#A78BFA",
    sizes: "(max-width: 768px) 100vw, 60vw",
  },
  {
    id: "black-girl-tablet",
    src: "/hero/black-girl-tablet.webp",
    srcSet: "",
    blurDataURL: "", // auto-populated by pnpm optimize:hero
    alt: "Girl using a tablet for personalized AI-powered education",
    width: 2752,
    height: 1536,
    accentColor: "#7C3AED",
    glowColor: "#A78BFA",
    sizes: "(max-width: 768px) 100vw, 60vw",
  },

  // ── Slide 2: "how-it-works" ──────────────────────────────────
  {
    id: "mother-son-sofa",
    src: "/hero/mother-son-sofa.webp",
    srcSet: "",
    blurDataURL: "", // auto-populated by pnpm optimize:hero
    alt: "Mother and son using AIVO Learning together on a sofa",
    width: 2752,
    height: 1536,
    accentColor: "#0D9488",
    glowColor: "#5EEAD4",
    sizes: "(max-width: 768px) 100vw, 60vw",
  },
  {
    id: "father-daughter-breakfast",
    src: "/hero/father-daughter-breakfast.webp",
    srcSet: "",
    blurDataURL: "", // auto-populated by pnpm optimize:hero
    alt: "Father and daughter learning together at the breakfast table",
    width: 2752,
    height: 1536,
    accentColor: "#0D9488",
    glowColor: "#5EEAD4",
    sizes: "(max-width: 768px) 100vw, 60vw",
  },

  // ── Additional hero images ───────────────────────────────────
  {
    id: "mobile-latino-boy-ipad",
    src: "/hero/mobile-latino-boy-ipad.webp",
    srcSet: "",
    blurDataURL: "", // auto-populated by pnpm optimize:hero
    alt: "Boy learning on an iPad with AIVO's AI tutors",
    width: 1536,
    height: 2752,
    accentColor: "#7C3AED",
    glowColor: "#C4B5FD",
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  {
    id: "parent-teacher-conference",
    src: "/hero/parent-teacher-conference.webp",
    srcSet: "",
    blurDataURL: "", // auto-populated by pnpm optimize:hero
    alt: "Parent and teacher reviewing student progress powered by AIVO analytics",
    width: 1536,
    height: 1024,
    accentColor: "#1A1A2E",
    glowColor: "#7C3AED",
    sizes: "(max-width: 768px) 100vw, 60vw",
  },
];

/** Look up a hero slide image by id */
export function getHeroSlideImage(
  imageId: string,
): HeroSlideImage | undefined {
  return HERO_SLIDE_IMAGES.find((img) => img.id === imageId);
}

/** Default image for slide 1 (AI Learning) */
export const SLIDE_1_IMAGE = HERO_SLIDE_IMAGES[0]; // arab-boy-chromebook

/** Default image for slide 2 (How It Works) */
export const SLIDE_2_IMAGE = HERO_SLIDE_IMAGES[2]; // mother-son-sofa

/** Image for slide 4 (Tablet Learning) */
export const SLIDE_3_IMAGE = HERO_SLIDE_IMAGES[1]; // black-girl-tablet

/** Image for slide 6 (Family Learning) */
export const SLIDE_4_IMAGE = HERO_SLIDE_IMAGES[3]; // father-daughter-breakfast

/** Image for slide 7 (Mobile Learning) */
export const SLIDE_5_IMAGE = HERO_SLIDE_IMAGES[4]; // mobile-latino-boy-ipad

/** Image for slide 8 (Parent-Teacher) */
export const SLIDE_6_IMAGE = HERO_SLIDE_IMAGES[5]; // parent-teacher-conference
