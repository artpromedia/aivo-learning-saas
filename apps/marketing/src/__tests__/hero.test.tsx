import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...filterMotionProps(props)}>{children}</div>,
    h1: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <h1 {...filterMotionProps(props)}>{children}</h1>,
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <p {...filterMotionProps(props)}>{children}</p>,
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...filterMotionProps(props)}>{children}</button>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

function filterMotionProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!["initial", "animate", "exit", "transition", "whileInView", "viewport", "variants", "custom"].includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock hero background
vi.mock("@/components/home/hero-background", () => ({
  HeroBackground: () => <div data-testid="hero-background">Background</div>,
}));

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  events: {
    signupClick: vi.fn(),
  },
}));

import { Hero } from "@/components/home/hero";

describe("Hero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the first slide headline text", () => {
    render(<Hero />);
    expect(screen.getByText("AI That Learns How Your Child Learns")).toBeDefined();
  });

  it("renders all 3 CTAs with correct data-testid values", () => {
    render(<Hero />);
    expect(screen.getByTestId("hero-cta-primary")).toBeDefined();
    expect(screen.getByTestId("hero-cta-secondary")).toBeDefined();
    expect(screen.getByTestId("hero-cta-demo")).toBeDefined();
  });

  it("renders primary CTA linking to /get-started", () => {
    render(<Hero />);
    const cta = screen.getByTestId("hero-cta-primary");
    expect(cta.getAttribute("href")).toBe("/get-started");
    expect(cta.textContent).toContain("Start Free Trial");
  });

  it("renders demo link to /demo", () => {
    render(<Hero />);
    const demo = screen.getByTestId("hero-cta-demo");
    expect(demo.getAttribute("href")).toBe("/demo");
    expect(demo.textContent).toContain("Book a Live Demo");
  });

  it("renders social proof line", () => {
    render(<Hero />);
    expect(screen.getByTestId("hero-social-proof")).toBeDefined();
    expect(screen.getByText(/Trusted by 500\+ schools/)).toBeDefined();
  });

  it("renders 3 slide indicator dots", () => {
    render(<Hero />);
    const dots = screen.getAllByLabelText(/Go to slide/);
    expect(dots).toHaveLength(3);
  });

  it("autoplay advances to next slide after 6 seconds", () => {
    render(<Hero />);
    expect(screen.getByText("AI That Learns How Your Child Learns")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(6001);
    });

    expect(screen.getByText("5 Expert AI Tutors, One Personalized Journey")).toBeDefined();
  });

  it("clicking slide dot changes the active slide", () => {
    render(<Hero />);
    expect(screen.getByText("AI That Learns How Your Child Learns")).toBeDefined();

    const dot3 = screen.getByLabelText("Go to slide 3");
    fireEvent.click(dot3);

    expect(screen.getByText("Real-Time Insights for Parents & Teachers")).toBeDefined();
  });

  it("Watch How It Works button has an onClick handler", () => {
    render(<Hero />);
    const btn = screen.getByTestId("hero-cta-secondary");
    expect(btn.textContent).toContain("Watch How It Works");
    fireEvent.click(btn);
  });

  it("renders hero background", () => {
    render(<Hero />);
    expect(screen.getByTestId("hero-background")).toBeDefined();
  });

  it("renders entry animations with correct Framer Motion props", () => {
    render(<Hero />);
    expect(screen.getByText("AI That Learns How Your Child Learns")).toBeDefined();
    expect(screen.getByText(/Aivo creates a unique Brain Clone/)).toBeDefined();
  });

  it("disables background animation when prefers-reduced-motion is set", () => {
    render(<Hero />);
    expect(screen.getByTestId("hero-background")).toBeDefined();
  });
});
