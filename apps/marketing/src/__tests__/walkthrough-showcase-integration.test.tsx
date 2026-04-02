import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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
        if (typeof v === "string" || typeof v === "number" || k === "className" || k === "style")
          safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
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

vi.mock("@/components/walkthrough/aivo-walkthrough-player", () => ({
  AivoWalkthroughPlayer: ({
    autoplay,
    source,
  }: {
    autoplay?: boolean;
    source?: string;
  }) => (
    <div
      data-testid="walkthrough-player"
      data-autoplay={String(autoplay)}
      data-source={source}
    >
      Player
    </div>
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

import { WalkthroughShowcase } from "@/components/home/walkthrough-showcase";

describe("WalkthroughShowcase Integration", () => {
  it("renders heading text", () => {
    render(<WalkthroughShowcase />);
    expect(
      screen.getByText("See Aivo in Action \u2014 No Signup Required"),
    ).toBeDefined();
  });

  it("renders walkthrough player", () => {
    render(<WalkthroughShowcase />);
    expect(screen.getByTestId("walkthrough-player")).toBeDefined();
  });

  it("renders Request a Demo at least 3 times", () => {
    render(<WalkthroughShowcase />);
    const links = screen.getAllByRole("link");
    const demoLinks = links.filter(
      (l) =>
        l.textContent?.includes("Request a Demo") ||
        l.textContent?.includes("Book a Demo"),
    );
    expect(demoLinks.length).toBeGreaterThanOrEqual(3);
  });

  it("top demo link has href /demo", () => {
    render(<WalkthroughShowcase />);
    const links = screen.getAllByRole("link");
    const topDemo = links.find(
      (l) => l.textContent?.includes("Request a Demo \u2192"),
    );
    expect(topDemo).toBeDefined();
    expect(topDemo?.getAttribute("href")).toBe("/demo");
  });

  it("bottom demo card contains transform classroom text", () => {
    render(<WalkthroughShowcase />);
    expect(
      screen.getByText("See how Aivo can transform your classroom"),
    ).toBeDefined();
  });

  it("renders all 3 feature callout cards", () => {
    render(<WalkthroughShowcase />);
    expect(screen.getByText("Brain Clone\u2122 Technology")).toBeDefined();
    expect(screen.getByText("5 Expert AI Tutors")).toBeDefined();
    expect(screen.getByText("Real-Time Analytics")).toBeDefined();
  });

  it("Start Free Trial links to /get-started", () => {
    render(<WalkthroughShowcase />);
    const links = screen.getAllByRole("link");
    const startTrial = links.find(
      (l) => l.textContent?.includes("Start Free Trial"),
    );
    expect(startTrial?.getAttribute("href")).toBe("/get-started");
  });
});
