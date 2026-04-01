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

// Mock DashboardMockup
vi.mock("@/components/home/dashboard-mockup", () => ({
  DashboardMockup: () => <div data-testid="dashboard-mockup">Dashboard Mockup</div>,
}));

// Mock AppStoreButtons
vi.mock("@/components/shared/app-store-buttons", () => ({
  AppStoreButtons: () => <div data-testid="app-store-buttons">App Store Buttons</div>,
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

  it("renders the first slide headline", () => {
    render(<Hero />);
    expect(screen.getByText("AI-Powered Learning That Adapts to Every Student")).toBeDefined();
  });

  it("renders primary CTA linking to /get-started on slide 1", () => {
    render(<Hero />);
    const cta = screen.getByTestId("hero-cta-primary");
    expect(cta.getAttribute("href")).toBe("/get-started");
    expect(cta.textContent).toContain("Get Started Free");
  });

  it("renders secondary CTA linking to /demo on slide 1", () => {
    render(<Hero />);
    const cta = screen.getByTestId("hero-cta-secondary");
    expect(cta.getAttribute("href")).toBe("/demo");
    expect(cta.textContent).toContain("Request a Demo");
  });

  it("renders 3 slide indicator dots", () => {
    render(<Hero />);
    const dots = screen.getAllByLabelText(/Go to slide/);
    expect(dots).toHaveLength(3);
  });

  it("renders prev/next navigation arrows", () => {
    render(<Hero />);
    expect(screen.getByLabelText("Previous slide")).toBeDefined();
    expect(screen.getByLabelText("Next slide")).toBeDefined();
  });

  it("autoplay advances to slide 2 after 6 seconds", () => {
    render(<Hero />);
    expect(screen.getByText("AI-Powered Learning That Adapts to Every Student")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(6001);
    });

    expect(screen.getByText("Personalized Paths for Every Learner")).toBeDefined();
  });

  it("clicking slide dot 3 shows dashboard slide with DashboardMockup", () => {
    render(<Hero />);
    fireEvent.click(screen.getByLabelText("Go to slide 3"));

    expect(screen.getByText("Track Progress in Real Time")).toBeDefined();
    expect(screen.getByTestId("dashboard-mockup")).toBeDefined();
  });

  it("clicking next arrow advances the slide", () => {
    render(<Hero />);
    fireEvent.click(screen.getByLabelText("Next slide"));
    expect(screen.getByText("Personalized Paths for Every Learner")).toBeDefined();
  });

  it("clicking previous arrow wraps to last slide", () => {
    render(<Hero />);
    fireEvent.click(screen.getByLabelText("Previous slide"));
    expect(screen.getByText("Track Progress in Real Time")).toBeDefined();
  });

  it("slide 2 has no secondary CTA", () => {
    render(<Hero />);
    fireEvent.click(screen.getByLabelText("Go to slide 2"));
    expect(screen.getByText("See How It Works")).toBeDefined();
    expect(screen.queryByTestId("hero-cta-secondary")).toBeNull();
  });

  it("slide 3 has both CTAs and DashboardMockup visual", () => {
    render(<Hero />);
    fireEvent.click(screen.getByLabelText("Go to slide 3"));
    expect(screen.getByTestId("hero-cta-primary")).toBeDefined();
    expect(screen.getByTestId("hero-cta-secondary")).toBeDefined();
    expect(screen.getByTestId("dashboard-mockup")).toBeDefined();
  });
});
