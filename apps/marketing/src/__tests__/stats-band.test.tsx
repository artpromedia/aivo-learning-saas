import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock AnimatedCounter
vi.mock("@/components/shared/animated-counter", () => ({
  AnimatedCounter: ({ target, suffix }: { target: number; suffix: string }) => (
    <span>{target}{suffix}</span>
  ),
}));

import { StatsBand } from "@/components/home/stats-band";

describe("StatsBand", () => {
  it("renders 4 stats", () => {
    render(<StatsBand />);
    expect(screen.getByText("Schools")).toBeDefined();
    expect(screen.getByText("Students")).toBeDefined();
    expect(screen.getByText("Lessons Delivered")).toBeDefined();
    expect(screen.getByText("Average Rating")).toBeDefined();
  });

  it("renders stat values", () => {
    render(<StatsBand />);
    expect(screen.getByText("500+")).toBeDefined();
    expect(screen.getByText("50000+")).toBeDefined();
  });

  it("renders trend arrows", () => {
    render(<StatsBand />);
    expect(screen.getByText("↑ 120% YoY")).toBeDefined();
    expect(screen.getByText("↑ 200% YoY")).toBeDefined();
  });
});
