import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { createPageMetadata } from "@/lib/metadata-factory";

afterEach(() => {
  cleanup();
});

// Mock all heavy home components for homepage render tests
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

// Mock demo page client component
vi.mock("@/app/demo/client", () => ({
  DemoPageClient: () => <div data-testid="demo-client" />,
}));

import HomePage, { metadata as homeMetadata } from "@/app/page";
import DemoPage, { metadata as demoMetadata } from "@/app/demo/page";

describe("Homepage SEO metadata", () => {
  it("exports metadata with correct title", () => {
    expect(homeMetadata.title).toBe(
      "AIVO Learning — AI-Powered Personalized Education",
    );
  });

  it("exports metadata with correct description", () => {
    expect(homeMetadata.description).toContain(
      "AI-powered personalized learning",
    );
    expect(homeMetadata.description).toContain("No learner left behind");
  });

  it("renders 3 JSON-LD script tags", () => {
    const { container } = render(<HomePage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBe(3);
  });

  it("each JSON-LD script contains valid JSON with schema.org context", () => {
    const { container } = render(<HomePage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    scripts.forEach((script) => {
      const json = JSON.parse(script.innerHTML);
      expect(json["@context"]).toBe("https://schema.org");
    });
  });

  it("renders Organization, WebSite, and SoftwareApplication schemas", () => {
    const { container } = render(<HomePage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const types = Array.from(scripts).map(
      (s) => JSON.parse(s.innerHTML)["@type"],
    );
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("SoftwareApplication");
  });
});

describe("Demo page SEO metadata", () => {
  it("exports metadata with canonical URL for /demo", () => {
    expect(demoMetadata.alternates?.canonical).toBe(
      "https://aivolearning.com/demo",
    );
  });

  it("exports metadata with correct title", () => {
    expect(demoMetadata.title).toBe("Request a Demo | AIVO Learning");
  });

  it("renders 2 JSON-LD script tags", () => {
    const { container } = render(<DemoPage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBe(2);
  });

  it("renders BreadcrumbList with 2 items", () => {
    const { container } = render(<DemoPage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const breadcrumb = Array.from(scripts)
      .map((s) => JSON.parse(s.innerHTML))
      .find((j) => j["@type"] === "BreadcrumbList");

    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0].name).toBe("Home");
    expect(breadcrumb.itemListElement[1].name).toBe("Request a Demo");
  });

  it("renders Organization schema", () => {
    const { container } = render(<DemoPage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const org = Array.from(scripts)
      .map((s) => JSON.parse(s.innerHTML))
      .find((j) => j["@type"] === "Organization");
    expect(org).toBeDefined();
  });
});

describe("createPageMetadata SEO properties", () => {
  const meta = createPageMetadata({
    title: "Test Page",
    description: "Test description",
    path: "/test",
  });

  it("generates hreflang alternates for 10 languages", () => {
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(languages).toBeDefined();
    const langKeys = Object.keys(languages);
    expect(langKeys).toHaveLength(10);
    expect(langKeys).toEqual(
      expect.arrayContaining([
        "en-US",
        "es-ES",
        "fr-FR",
        "ar-SA",
        "zh-CN",
        "pt-BR",
        "sw-KE",
        "ig-NG",
        "yo-NG",
        "ha-NG",
      ]),
    );
  });

  it("includes twitter card with summary_large_image", () => {
    const twitter = meta.twitter as Record<string, unknown>;
    expect(twitter.card).toBe("summary_large_image");
  });

  it("includes OG image with correct dimensions", () => {
    const og = meta.openGraph as Record<string, unknown>;
    const images = og.images as Array<Record<string, unknown>>;
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });
});
