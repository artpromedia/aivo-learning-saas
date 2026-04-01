import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    h1: ({ children }: React.PropsWithChildren) => <h1>{children}</h1>,
    p: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || k === "className") safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || k === "className") safe[k] = v;
      }
      return <span {...safe}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("lucide-react", () => ({
  Check: () => <span>✓</span>,
  Minus: () => <span>—</span>,
  ChevronDown: () => <span>▼</span>,
}));

vi.mock("@/components/shared/section-header", () => ({
  SectionHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div><h2>{title}</h2><p>{subtitle}</p></div>
  ),
}));

const mockEvents = {
  pricingView: vi.fn(),
  pricingToggle: vi.fn(),
  faqExpand: vi.fn(),
};
vi.mock("@/lib/analytics", () => ({ events: mockEvents }));

vi.mock("@/lib/ab-testing", () => ({
  getVariant: () => "monthly",
  EXPERIMENTS: {
    pricingDefault: { id: "pricing-default-v1", variants: ["monthly", "annual"] },
  },
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { PricingPageClient } from "@/app/pricing/client";

describe("PricingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3 pricing cards with correct names", () => {
    render(<PricingPageClient />);
    expect(screen.getByText("Free")).toBeDefined();
    expect(screen.getByText("Pro")).toBeDefined();
    expect(screen.getByText("District")).toBeDefined();
  });

  it("shows MOST POPULAR badge on Pro card", () => {
    render(<PricingPageClient />);
    expect(screen.getByText("MOST POPULAR")).toBeDefined();
  });

  it("toggle switches between monthly/annual prices", () => {
    render(<PricingPageClient />);
    // Initially monthly (from AB test mock)
    expect(screen.getByText("$19")).toBeDefined();

    // Click toggle
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(screen.getByText("$15.2")).toBeDefined();
  });

  it("shows Save 20% badge when annual", () => {
    render(<PricingPageClient />);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(screen.getByText("Save 20%")).toBeDefined();
  });

  it("renders FAQ accordion that expands/collapses", () => {
    render(<PricingPageClient />);
    const faqBtn = screen.getByText("Is there really a free plan?");
    fireEvent.click(faqBtn);
    expect(screen.getByText(/Our Free plan gives you/)).toBeDefined();
  });

  it("renders all CTA buttons with correct hrefs", () => {
    render(<PricingPageClient />);
    const links = screen.getAllByRole("link");
    const getStarted = links.filter((l) => l.getAttribute("href") === "/get-started");
    const demo = links.filter((l) => l.getAttribute("href") === "/demo");
    expect(getStarted.length).toBeGreaterThan(0);
    expect(demo.length).toBeGreaterThan(0);
  });

  it("fires pricingView event on mount", () => {
    render(<PricingPageClient />);
    expect(mockEvents.pricingView).toHaveBeenCalled();
  });

  it("fires pricingToggle event on toggle", () => {
    render(<PricingPageClient />);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(mockEvents.pricingToggle).toHaveBeenCalledWith("annual");
  });

  it("renders feature comparison table when expanded", () => {
    render(<PricingPageClient />);
    fireEvent.click(screen.getByText("Show full comparison"));
    expect(screen.getByText("Student profiles")).toBeDefined();
    expect(screen.getByText("AI Tutors")).toBeDefined();
  });

  it("shows District plan with Custom price", () => {
    render(<PricingPageClient />);
    expect(screen.getByText("Custom")).toBeDefined();
  });
});
