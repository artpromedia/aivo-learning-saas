import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className") safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/components/walkthrough/aivo-walkthrough-player", () => ({
  AivoWalkthroughPlayer: ({ autoplay, source }: { autoplay?: boolean; source?: string }) => (
    <div data-testid="walkthrough-player" data-autoplay={String(autoplay)} data-source={source}>
      Player
    </div>
  ),
}));

vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn() },
}));

import { WalkthroughShowcase } from "@/components/home/walkthrough-showcase";

describe("WalkthroughShowcase", () => {
  it("renders section with correct id", () => {
    const { container } = render(<WalkthroughShowcase />);
    const section = container.querySelector("#product-walkthrough");
    expect(section).not.toBeNull();
  });

  it("renders heading and subheading text", () => {
    render(<WalkthroughShowcase />);
    expect(screen.getByText("See Aivo in Action — No Signup Required")).toBeDefined();
    expect(screen.getByText(/Watch how Aivo creates/)).toBeDefined();
  });

  it("renders 3 feature cards with correct content", () => {
    render(<WalkthroughShowcase />);
    expect(screen.getByText("Brain Clone™ Technology")).toBeDefined();
    expect(screen.getByText("5 Expert AI Tutors")).toBeDefined();
    expect(screen.getByText("Real-Time Analytics")).toBeDefined();
    expect(screen.getByText("A unique AI model for every student")).toBeDefined();
  });

  it("renders CTA buttons with correct links", () => {
    render(<WalkthroughShowcase />);
    const links = screen.getAllByRole("link");
    const startTrial = links.find((l) => l.textContent?.includes("Start Free Trial"));
    const bookDemo = links.find((l) => l.textContent?.includes("Book a Demo"));
    expect(startTrial?.getAttribute("href")).toBe("/get-started");
    expect(bookDemo?.getAttribute("href")).toBe("/demo");
  });

  it("renders player with autoplay=false", () => {
    render(<WalkthroughShowcase />);
    const player = screen.getByTestId("walkthrough-player");
    expect(player.getAttribute("data-autoplay")).toBe("false");
  });
});
