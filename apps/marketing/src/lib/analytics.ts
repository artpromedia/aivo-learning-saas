/**
 * Plausible Analytics event tracking.
 *
 * Plausible is loaded via a <script> tag in layout.tsx.
 * This module provides typed wrappers for custom event goals.
 */

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number> },
    ) => void;
  }
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number>,
) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(name, { props });
  }
}

export const events = {
  signupClick: (source: string) =>
    trackEvent("Signup Click", { source }),

  demoRequest: (districtSize?: number) =>
    trackEvent("Demo Request", { districtSize: districtSize ?? 0 }),

  pricingView: (plan: string) =>
    trackEvent("Pricing View", { plan }),

  tutorExplore: (tutor: string) =>
    trackEvent("Tutor Explore", { tutor }),

  exitIntentCapture: () =>
    trackEvent("Exit Intent Capture"),

  faqExpand: (question: string) =>
    trackEvent("FAQ Expand", { question }),

  blogRead: (slug: string) =>
    trackEvent("Blog Read", { slug }),

  contactSubmit: (subject: string) =>
    trackEvent("Contact Submit", { subject }),

  experimentExposed: (experiment: string, variant: string) =>
    trackEvent("Experiment Exposed", { experiment, variant }),

  experimentConverted: (experiment: string, variant: string) =>
    trackEvent("Experiment Converted", { experiment, variant }),
};
