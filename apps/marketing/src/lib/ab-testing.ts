/**
 * Lightweight client-side A/B testing with Plausible event tracking.
 *
 * Uses MurmurHash3 for deterministic bucketing so the same visitor
 * always sees the same variant within a session.
 */

import { events } from "./analytics";

const VISITOR_ID_KEY = "aivo_visitor_id";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "ssr";

  let id = sessionStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

/**
 * MurmurHash3 (32-bit) — fast, well-distributed hash for bucketing.
 */
function murmurHash3(key: string, seed = 0): number {
  let h = seed;
  const len = key.length;

  for (let i = 0; i < len; i++) {
    let k = key.charCodeAt(i);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);

    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = Math.imul(h, 5) + 0xe6546b64;
  }

  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  return h >>> 0;
}

/**
 * Get a deterministic variant for the current visitor.
 *
 * Same visitor + same experiment = same variant every time.
 */
export function getVariant(
  experimentId: string,
  variants: string[],
): string {
  if (variants.length === 0) return "";
  if (variants.length === 1) return variants[0];

  const visitorId = getOrCreateVisitorId();
  const hash = murmurHash3(`${experimentId}:${visitorId}`);
  const bucket = hash % variants.length;
  return variants[bucket];
}

/**
 * Get variant and automatically track exposure via Plausible.
 */
export function getVariantWithTracking(
  experimentId: string,
  variants: string[],
): string {
  const variant = getVariant(experimentId, variants);
  events.experimentExposed(experimentId, variant);
  return variant;
}

/**
 * Track a conversion for a specific experiment.
 */
export function trackConversion(experimentId: string, variant: string): void {
  events.experimentConverted(experimentId, variant);
}

/**
 * Pre-configured experiments.
 */
export const EXPERIMENTS = {
  heroHeadline: {
    id: "hero-headline-v1",
    variants: [
      "AI-Powered Learning That Adapts to Every Student",
      "Every Learner Deserves Their Own Brain",
    ],
  },
  ctaColor: {
    id: "cta-color-v1",
    variants: ["purple", "green"],
  },
  pricingDefault: {
    id: "pricing-default-v1",
    variants: ["monthly", "annual"],
  },
} as const;
