/**
 * Plausible Analytics event tracking.
 *
 * Plausible is loaded via a `<script>` tag in layout.tsx.
 * This module provides typed wrappers for every custom event goal
 * used across the marketing funnel.
 */

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number> },
    ) => void;
  }
}

/**
 * Low-level event dispatch. Safe to call during SSR — silently no-ops
 * when `window` or `window.plausible` is unavailable.
 */
export function trackEvent(
  name: string,
  props?: Record<string, string | number>,
): void {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(name, { props });
  }
}

export const events = {
  /** User clicked a "Get Started" / signup CTA. */
  signupClick: (source: string): void =>
    trackEvent("Signup Click", { source }),

  /** User requested a demo (legacy — prefer demoBookingStarted). */
  demoRequest: (districtSize?: number): void =>
    trackEvent("Demo Request", { districtSize: districtSize ?? 0 }),

  /** Booking widget opened. */
  demoBookingStarted: (source: string): void =>
    trackEvent("Demo Booking Started", { source }),

  /** Booking confirmed with a selected time slot. */
  demoBookingCompleted: (source: string, timeSlot: string): void =>
    trackEvent("Demo Booking Completed", { source, timeSlot }),

  /** Video walkthrough playback started. */
  videoWalkthroughStarted: (source: string): void =>
    trackEvent("Video Walkthrough Started", { source }),

  /** Video walkthrough playback completed. */
  videoWalkthroughCompleted: (source: string, watchTimeMs: number): void =>
    trackEvent("Video Walkthrough Completed", { source, watchTimeMs }),

  /** Video walkthrough reached a milestone (25 / 50 / 75%). */
  videoWalkthroughMilestone: (source: string, percent: number): void =>
    trackEvent("Video Walkthrough Milestone", { source, percent }),

  /** Scroll depth threshold reached (25 / 50 / 75 / 100%). */
  scrollDepth: (percent: number): void =>
    trackEvent("Scroll Depth", { percent }),

  /** Cumulative active time on page threshold reached. */
  timeOnPage: (seconds: number): void =>
    trackEvent("Time on Page", { seconds }),

  /** Newsletter subscription form submitted successfully. */
  newsletterSubscribed: (source: string): void =>
    trackEvent("Newsletter Subscribed", { source }),

  /** Pricing page billing-cycle toggle (monthly ↔ annual). */
  pricingToggle: (billingCycle: string): void =>
    trackEvent("Pricing Toggle", { billingCycle }),

  /** Generic CTA click tracker. */
  ctaClicked: (ctaId: string, location: string): void =>
    trackEvent("CTA Clicked", { ctaId, location }),

  /** Pricing page viewed. */
  pricingView: (plan: string): void =>
    trackEvent("Pricing View", { plan }),

  /** Tutor card explored. */
  tutorExplore: (tutor: string): void =>
    trackEvent("Tutor Explore", { tutor }),

  /** Exit-intent modal was shown and email captured. */
  exitIntentCapture: (): void =>
    trackEvent("Exit Intent Capture"),

  /** FAQ accordion item expanded. */
  faqExpand: (question: string): void =>
    trackEvent("FAQ Expand", { question }),

  /** Blog post read. */
  blogRead: (slug: string): void =>
    trackEvent("Blog Read", { slug }),

  /** Contact form submitted. */
  contactSubmit: (subject: string): void =>
    trackEvent("Contact Submit", { subject }),

  /** A/B experiment exposure tracked. */
  experimentExposed: (experiment: string, variant: string): void =>
    trackEvent("Experiment Exposed", { experiment, variant }),

  /** A/B experiment conversion tracked. */
  experimentConverted: (experiment: string, variant: string): void =>
    trackEvent("Experiment Converted", { experiment, variant }),

  /** Lead magnet downloaded. */
  leadMagnetDownload: (source: string): void =>
    trackEvent("Lead Magnet Download", { source }),
};
