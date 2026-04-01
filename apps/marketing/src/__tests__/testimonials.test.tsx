import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || k === "className") safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
  ChevronLeft: () => <span>←</span>,
  ChevronRight: () => <span>→</span>,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { Testimonials } from "@/components/home/testimonials";

describe("Testimonials", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders testimonial data (6 total)", () => {
    render(<Testimonials />);
    // First page shows 3 testimonials
    expect(screen.getByText("Sarah Chen")).toBeDefined();
  });

  it("renders navigation dots based on pages (6/3 = 2)", () => {
    render(<Testimonials />);
    const dots = screen.getAllByLabelText(/Go to testimonial page/);
    expect(dots.length).toBe(2);
  });

  it("clicking next shows next testimonial page", () => {
    render(<Testimonials />);
    const nextBtn = screen.getByLabelText("Next testimonials");
    fireEvent.click(nextBtn);
    // Page 2 should show different testimonials
    expect(screen.getByText("David Thompson")).toBeDefined();
  });

  it("autoplay advances after 8 seconds", () => {
    render(<Testimonials />);
    // Initially shows page 1
    expect(screen.getByText("Sarah Chen")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(8001);
    });

    // Should advance to page 2
    expect(screen.getByText("David Thompson")).toBeDefined();
  });

  it("renders star ratings as SVGs", () => {
    const { container } = render(<Testimonials />);
    const stars = container.querySelectorAll("svg.text-amber-400");
    // 3 visible cards × 5 stars = 15 stars
    expect(stars.length).toBe(15);
  });

  it("renders verified badge", () => {
    render(<Testimonials />);
    const badges = screen.getAllByText("Verified ✓");
    expect(badges.length).toBeGreaterThan(0);
  });
});
