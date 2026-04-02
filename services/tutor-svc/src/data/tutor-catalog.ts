export interface CatalogItem {
  sku: string;
  name: string;
  subject: string;
  persona: string;
  price: number;
  description: string;
}

export const TUTOR_CATALOG: CatalogItem[] = [
  {
    sku: "ADDON_TUTOR_MATH",
    name: "Nova — Math Tutor",
    subject: "math",
    persona: "nova",
    price: 4.99,
    description:
      "Cosmos-themed math tutor with step-by-step visual explanations",
  },
  {
    sku: "ADDON_TUTOR_ELA",
    name: "Sage — Reading & Writing Tutor",
    subject: "ela",
    persona: "sage",
    price: 4.99,
    description:
      "Narrative-driven ELA tutor with Socratic questioning",
  },
  {
    sku: "ADDON_TUTOR_SCIENCE",
    name: "Spark — Science Tutor",
    subject: "science",
    persona: "spark",
    price: 4.99,
    description:
      "Experiment-first science tutor with hypothesis-driven learning",
  },
  {
    sku: "ADDON_TUTOR_HISTORY",
    name: "Chrono — History Tutor",
    subject: "history",
    persona: "chrono",
    price: 4.99,
    description:
      "Time-travel narrative history tutor with primary source analysis",
  },
  {
    sku: "ADDON_TUTOR_CODING",
    name: "Pixel — Coding Tutor",
    subject: "coding",
    persona: "pixel",
    price: 4.99,
    description:
      "Pair-programming coding tutor with block-to-text progression",
  },
  {
    sku: "ADDON_TUTOR_SEL",
    name: "Harmony — SEL Coach",
    subject: "sel",
    persona: "harmony",
    price: 4.99,
    description:
      "Garden-themed social-emotional learning coach with CASEL-aligned competency building",
  },
  {
    sku: "ADDON_TUTOR_SPEECH",
    name: "Echo — Speech Practice Companion",
    subject: "speech",
    persona: "echo",
    price: 4.99,
    description:
      "Musical, gamified speech and language practice companion with sound safari adventures",
  },
  {
    sku: "ADDON_TUTOR_BUNDLE",
    name: "All Tutors Bundle",
    subject: "all",
    persona: "bundle",
    price: 19.99,
    description: "Full access to all 7 AI tutors at 40%+ savings",
  },
];

export const BUNDLE_SKU = "ADDON_TUTOR_BUNDLE";

export const INDIVIDUAL_SKUS = TUTOR_CATALOG
  .filter((item) => item.sku !== BUNDLE_SKU)
  .map((item) => item.sku);

export function getSkuForSubject(subject: string): string | null {
  const item = TUTOR_CATALOG.find((i) => i.subject === subject && i.sku !== BUNDLE_SKU);
  return item?.sku ?? null;
}

export function getSubjectForSku(sku: string): string | null {
  const item = TUTOR_CATALOG.find((i) => i.sku === sku);
  return item?.subject ?? null;
}
