import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className")
          safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
    button: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className")
          safe[k] = v;
      }
      return <button {...safe}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/home/dashboard-mockup", () => ({
  DashboardMockup: () => (
    <div data-testid="dashboard-mockup">Dashboard Mockup</div>
  ),
}));

vi.mock("@/components/home/brain-clone-mockup", () => ({
  BrainCloneMockup: () => (
    <div data-testid="brain-clone-mockup">Brain Clone Mockup</div>
  ),
}));

vi.mock("@/components/home/tutors-mockup", () => ({
  TutorsMockup: () => (
    <div data-testid="tutors-mockup">Tutors Mockup</div>
  ),
}));

vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn() },
}));

vi.mock("@/providers/i18n-provider", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const en = require("../../messages/en.json") as Record<string, Record<string, string>>;
  return {
    useI18n: () => ({
      locale: "en",
      messages: en,
      t: (section: string, key: string) => en[section]?.[key] ?? key,
    }),
  };
});

import { Hero } from "@/components/home/hero";

describe("Hero Slider", () => {
  it("renders slide 1 headline by default", () => {
    render(<Hero />);
    expect(
      screen.getByText("AI-Powered Learning That Adapts to Every Student"),
    ).toBeDefined();
  });

  it("renders both CTAs on slide 1", () => {
    render(<Hero />);
    const links = screen.getAllByRole("link");
    const getStarted = links.find(
      (l) => l.textContent === "Get Started Free",
    );
    const requestDemo = links.find(
      (l) => l.textContent === "Request a Demo",
    );
    expect(getStarted).toBeDefined();
    expect(getStarted?.getAttribute("href")).toBe("/get-started");
    expect(requestDemo).toBeDefined();
    expect(requestDemo?.getAttribute("href")).toBe("/demo");
  });

  it("navigates to all 5 slides via Next button", async () => {
    const user = userEvent.setup();
    render(<Hero />);

    const nextBtn = screen.getByLabelText("Next slide");

    // Slide 1 is visible
    expect(
      screen.getByText("AI-Powered Learning That Adapts to Every Student"),
    ).toBeDefined();

    // Go to slide 2
    await user.click(nextBtn);
    expect(
      screen.getByText("Personalized Paths for Every Learner"),
    ).toBeDefined();

    // Go to slide 3
    await user.click(nextBtn);
    expect(
      screen.getByText(/Built for IEP Students/),
    ).toBeDefined();

    // Go to slide 4
    await user.click(nextBtn);
    expect(
      screen.getByText("5 Expert AI Tutors, One Personalized Journey"),
    ).toBeDefined();

    // Go to slide 5
    await user.click(nextBtn);
    expect(
      screen.getByText("Track Progress in Real Time"),
    ).toBeDefined();
  });

  it("renders DashboardMockup on slide 5", async () => {
    const user = userEvent.setup();
    render(<Hero />);

    const nextBtn = screen.getByLabelText("Next slide");
    // Navigate to slide 5
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);

    expect(screen.getByTestId("dashboard-mockup")).toBeDefined();
  });

  it("renders 5 navigation dots", () => {
    render(<Hero />);
    const dots = screen.getAllByLabelText(/Go to slide \d+/);
    expect(dots).toHaveLength(5);
  });

  it("renders prev and next arrow buttons", () => {
    render(<Hero />);
    expect(screen.getByLabelText("Previous slide")).toBeDefined();
    expect(screen.getByLabelText("Next slide")).toBeDefined();
  });

  it("slide 2 secondary CTA links to #product-walkthrough", async () => {
    const user = userEvent.setup();
    render(<Hero />);

    const nextBtn = screen.getByLabelText("Next slide");
    await user.click(nextBtn);

    const links = screen.getAllByRole("link");
    const walkthrough = links.find(
      (l) => l.textContent === "Watch the Walkthrough",
    );
    expect(walkthrough).toBeDefined();
    expect(walkthrough?.getAttribute("href")).toBe("#product-walkthrough");
  });
});
