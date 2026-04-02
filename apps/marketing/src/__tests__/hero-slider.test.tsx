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

vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn() },
}));

// Mock i18n provider — return keys as-is so English hardcoded expectations still work
// since the en.json values match the original hardcoded strings
const enMessages: Record<string, Record<string, string>> = {
  hero: {
    headline: "AI-Powered Learning That Adapts to Every Student",
    subheadline: "No Learner Left Behind. Personalized education powered by Brain Clone AI technology that creates a unique learning profile for every student.",
    cta: "Get Started Free",
    ctaSecondary: "Request a Demo",
    slide2Headline: "Personalized Paths for Every Learner",
    slide2Subheadline: "Our AI adapts in real time, identifying strengths and gaps to create a custom curriculum that keeps students engaged and on track.",
    slide2Cta: "See How It Works",
    slide2CtaSecondary: "Watch the Walkthrough",
    slide3Headline: "Built for IEP Students — Loved by All",
    slide3Subheadline: "Whether your child has an IEP, a 504 plan, or just needs extra support, Aivo\u2019s Brain Clone AI builds a learning experience as unique as they are.",
    slide3Cta: "Get Started Free",
    slide3CtaSecondary: "Request a Demo",
    slide4Headline: "5 Expert AI Tutors, One Personalized Journey",
    slide4Subheadline: "From math to reading comprehension, our specialized AI tutors meet students where they are and guide them forward \u2014 with patience, encouragement, and adaptive intelligence.",
    slide4Cta: "Meet the Tutors",
    slide4CtaSecondary: "Book a Demo",
    slide5Headline: "Track Progress in Real Time",
    slide5Subheadline: "A beautiful learner dashboard gives students, parents, and teachers instant visibility into progress, streaks, and AI-powered recommendations.",
    slide5Cta: "Get Started Free",
    slide5CtaSecondary: "View Case Studies",
  },
};

vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "en",
    messages: enMessages,
    t: (key: string): string => {
      const parts = key.split(".");
      let current: any = enMessages;
      for (const part of parts) {
        if (current == null || typeof current !== "object") return key;
        current = current[part];
      }
      return typeof current === "string" ? current : key;
    },
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
}));

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
