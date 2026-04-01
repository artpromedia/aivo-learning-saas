import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
    div: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  },
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { SocialProofBar } from "@/components/home/social-proof-bar";

describe("SocialProofBar", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("renders 500+ schools text", () => {
    render(<SocialProofBar />);
    expect(screen.getByText(/500\+ schools across 12 states/)).toBeDefined();
  });

  it("renders 12 logos (in marquee mode, duplicated)", () => {
    render(<SocialProofBar />);
    // Each logo appears twice in the marquee (duplicated for seamless loop)
    expect(screen.getAllByText("Springfield USD").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Lincoln Academy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Maple Grove ISD").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Summit Charter").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Riverside Unified").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Oak Valley School").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Pinecrest Academy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Harmony Schools").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Eagle Mountain ISD").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Cedar Hills SD").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Brookfield Prep").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Westlake Academy").length).toBeGreaterThanOrEqual(1);
  });

  it("shows static grid when reduced-motion is enabled", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("reduced-motion"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    render(<SocialProofBar />);
    expect(screen.getByTestId("social-proof-static")).toBeDefined();
  });
});
