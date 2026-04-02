export type TutorPersona =
  | "nova"
  | "sage"
  | "spark"
  | "chrono"
  | "pixel"
  | "harmony"
  | "echo";

export interface TutorAvatarConfig {
  persona: TutorPersona;
  name: string;
  subject: string;
  tagline: string;
  sellingPoints: [string, string, string];
  primaryColor: string;
  accentColor: string;
  tailwindRing: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindGradientFrom: string;
  tailwindGradientTo: string;
  heroImage: string;
  avatarImage: string;
}

export const TUTOR_AVATARS: Record<TutorPersona, TutorAvatarConfig> = {
  nova: {
    persona: "nova",
    name: "Nova",
    subject: "Mathematics",
    tagline:
      "Turn math anxiety into cosmic confidence \u2014 one orbit at a time",
    sellingPoints: [
      "Adapts difficulty in real-time to your child\u2019s level",
      "Visual-first explanations that make abstract math tangible",
      "Celebrates every attempt \u2014 wrong answers are just \u2018different orbits\u2019",
    ],
    primaryColor: "#7C3AED",
    accentColor: "#A78BFA",
    tailwindRing: "ring-purple-400",
    tailwindBg: "bg-purple-50",
    tailwindText: "text-purple-700",
    tailwindGradientFrom: "from-purple-500",
    tailwindGradientTo: "to-violet-700",
    heroImage: "/assets/tutors/optimized/nova-hero.webp",
    avatarImage: "/assets/tutors/optimized/nova-avatar.webp",
  },
  sage: {
    persona: "sage",
    name: "Sage",
    subject: "English Language Arts",
    tagline:
      "Every child has a story worth telling. Sage helps them find it.",
    sellingPoints: [
      "Turns reading comprehension into detective work",
      "Writing workshops with encouraging, constructive feedback",
      "Vocabulary building woven naturally into engaging stories",
    ],
    primaryColor: "#0D9488",
    accentColor: "#5EEAD4",
    tailwindRing: "ring-teal-400",
    tailwindBg: "bg-teal-50",
    tailwindText: "text-teal-700",
    tailwindGradientFrom: "from-teal-500",
    tailwindGradientTo: "to-emerald-700",
    heroImage: "/assets/tutors/optimized/sage-hero.webp",
    avatarImage: "/assets/tutors/optimized/sage-avatar.webp",
  },
  spark: {
    persona: "spark",
    name: "Spark",
    subject: "Science",
    tagline:
      "Make science feel like magic with hands-on discovery adventures",
    sellingPoints: [
      "Virtual experiments your child can run themselves",
      "Builds real scientific thinking, not just memorization",
      "Connects every concept to your child\u2019s everyday world",
    ],
    primaryColor: "#F59E0B",
    accentColor: "#FCD34D",
    tailwindRing: "ring-amber-400",
    tailwindBg: "bg-amber-50",
    tailwindText: "text-amber-700",
    tailwindGradientFrom: "from-amber-500",
    tailwindGradientTo: "to-orange-600",
    heroImage: "/assets/tutors/optimized/spark-hero.webp",
    avatarImage: "/assets/tutors/optimized/spark-avatar.webp",
  },
  chrono: {
    persona: "chrono",
    name: "Chrono",
    subject: "History",
    tagline:
      "History isn\u2019t dates to memorize \u2014 it\u2019s the greatest story ever told",
    sellingPoints: [
      "Time-travel adventures through key historical eras",
      "Teaches perspective-taking and empathy through history",
      "Primary source analysis made accessible and exciting",
    ],
    primaryColor: "#E11D48",
    accentColor: "#FDA4AF",
    tailwindRing: "ring-rose-400",
    tailwindBg: "bg-rose-50",
    tailwindText: "text-rose-700",
    tailwindGradientFrom: "from-rose-500",
    tailwindGradientTo: "to-red-700",
    heroImage: "/assets/tutors/optimized/chrono-hero.webp",
    avatarImage: "/assets/tutors/optimized/chrono-avatar.webp",
  },
  pixel: {
    persona: "pixel",
    name: "Pixel",
    subject: "Coding",
    tagline:
      "Coding is a superpower anyone can learn. Pixel makes it fun.",
    sellingPoints: [
      "Smooth progression from visual blocks to real code",
      "Every bug is a puzzle, every project is shareable",
      "Pair-programming style \u2014 your child leads, Pixel guides",
    ],
    primaryColor: "#10B981",
    accentColor: "#6EE7B7",
    tailwindRing: "ring-emerald-400",
    tailwindBg: "bg-emerald-50",
    tailwindText: "text-emerald-700",
    tailwindGradientFrom: "from-emerald-500",
    tailwindGradientTo: "to-green-700",
    heroImage: "/assets/tutors/optimized/pixel-hero.webp",
    avatarImage: "/assets/tutors/optimized/pixel-avatar.webp",
  },
  harmony: {
    persona: "harmony",
    name: "Harmony",
    subject: "Social-Emotional Learning",
    tagline:
      "Build the emotional skills that power everything else in life",
    sellingPoints: [
      "CASEL-aligned social-emotional skill building",
      "Mindfulness exercises and emotion regulation tools",
      "Bridges emotional wellness to academic confidence",
    ],
    primaryColor: "#8B5CF6",
    accentColor: "#C4B5FD",
    tailwindRing: "ring-violet-400",
    tailwindBg: "bg-violet-50",
    tailwindText: "text-violet-700",
    tailwindGradientFrom: "from-violet-500",
    tailwindGradientTo: "to-purple-700",
    heroImage: "/assets/tutors/optimized/harmony-hero.webp",
    avatarImage: "/assets/tutors/optimized/harmony-avatar.webp",
  },
  echo: {
    persona: "echo",
    name: "Echo",
    subject: "Speech & Language",
    tagline:
      "Find your voice, one sound at a time \u2014 with a practice buddy who never gives up",
    sellingPoints: [
      "Gamified speech and language practice (Sound Safari!)",
      "Reinforces SLP-assigned exercises with fun repetition",
      "Celebrates every attempt \u2014 building confidence with each sound",
    ],
    primaryColor: "#F472B6",
    accentColor: "#FBCFE8",
    tailwindRing: "ring-pink-400",
    tailwindBg: "bg-pink-50",
    tailwindText: "text-pink-700",
    tailwindGradientFrom: "from-pink-400",
    tailwindGradientTo: "to-rose-600",
    heroImage: "/assets/tutors/optimized/echo-hero.webp",
    avatarImage: "/assets/tutors/optimized/echo-avatar.webp",
  },
};

export const TUTOR_ORDER: TutorPersona[] = [
  "nova",
  "sage",
  "spark",
  "chrono",
  "pixel",
  "harmony",
  "echo",
];

export function getTutorConfig(persona: TutorPersona): TutorAvatarConfig {
  return TUTOR_AVATARS[persona];
}
