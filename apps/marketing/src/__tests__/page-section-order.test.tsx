import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("@/components/home/hero", () => ({
  Hero: () => <div data-testid="hero" />,
}));
vi.mock("@/components/home/social-proof-bar", () => ({
  SocialProofBar: () => <div data-testid="social-proof" />,
}));
vi.mock("@/components/home/features-grid", () => ({
  FeaturesGrid: () => <div data-testid="features" />,
}));
vi.mock("@/components/home/how-it-works", () => ({
  HowItWorks: () => <div data-testid="how-it-works" />,
}));
vi.mock("@/components/home/walkthrough-showcase", () => ({
  WalkthroughShowcase: () => <div data-testid="walkthrough-showcase" />,
}));
vi.mock("@/components/home/ai-tutors", () => ({
  AiTutors: () => <div data-testid="ai-tutors" />,
}));
vi.mock("@/components/home/audience-tabs", () => ({
  AudienceTabs: () => <div data-testid="audience-tabs" />,
}));
vi.mock("@/components/home/stats-band", () => ({
  StatsBand: () => <div data-testid="stats-band" />,
}));
vi.mock("@/components/cro/trust-badges", () => ({
  TrustBadges: () => <div data-testid="trust-badges" />,
}));
vi.mock("@/components/home/testimonials", () => ({
  Testimonials: () => <div data-testid="testimonials" />,
}));
vi.mock("@/components/home/cta-band", () => ({
  CtaBand: () => <div data-testid="cta-band" />,
}));

import HomePage from "@/app/page";

describe("HomePage section order", () => {
  it("renders sections in correct order", () => {
    const { container } = render(<HomePage />);
    const testIds = Array.from(
      container.querySelectorAll("[data-testid]"),
    ).map((el) => el.getAttribute("data-testid"));

    expect(testIds).toEqual([
      "hero",
      "social-proof",
      "features",
      "how-it-works",
      "walkthrough-showcase",
      "ai-tutors",
      "audience-tabs",
      "stats-band",
      "trust-badges",
      "testimonials",
      "cta-band",
    ]);
  });
});
