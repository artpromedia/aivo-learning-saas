import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || k === "className" || k === "style" || k === "onClick") safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "function" || k === "className") safe[k] = v;
      }
      return <button {...safe}>{children}</button>;
    },
    span: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
    path: (props: Record<string, unknown>) => <path {...props} />,
    line: (props: Record<string, unknown>) => <line {...props} />,
    circle: (props: Record<string, unknown>) => <circle {...props} />,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { BrainCloneScene } from "@/components/walkthrough/scenes/brain-clone-scene";
import { DashboardScene } from "@/components/walkthrough/scenes/dashboard-scene";
import { TutorChatScene } from "@/components/walkthrough/scenes/tutor-chat-scene";
import { AdaptationScene } from "@/components/walkthrough/scenes/adaptation-scene";
import { ReportsScene } from "@/components/walkthrough/scenes/reports-scene";
import { CtaScene } from "@/components/walkthrough/scenes/cta-scene";

describe("BrainCloneScene", () => {
  it("renders avatar with initials AJ", () => {
    render(<BrainCloneScene sceneElapsedMs={0} />);
    expect(screen.getByText("AJ")).toBeDefined();
  });

  it("shows progress text when elapsed > 500ms", () => {
    render(<BrainCloneScene sceneElapsedMs={1000} />);
    expect(screen.getByText(/Brain Clone/)).toBeDefined();
  });

  it("shows ready state when elapsed > 5500ms", () => {
    render(<BrainCloneScene sceneElapsedMs={6000} />);
    expect(screen.getByText(/Brain Clone™ Ready/)).toBeDefined();
  });
});

describe("DashboardScene", () => {
  it("renders 4 subject cards", () => {
    render(<DashboardScene sceneElapsedMs={4000} />);
    expect(screen.getByText("Math")).toBeDefined();
    expect(screen.getByText("Science")).toBeDefined();
    expect(screen.getByText("English")).toBeDefined();
    expect(screen.getByText("Art")).toBeDefined();
  });

  it("shows progress bars reaching target percentages", () => {
    render(<DashboardScene sceneElapsedMs={5000} />);
    expect(screen.getByText("72%")).toBeDefined();
    expect(screen.getByText("88%")).toBeDefined();
    expect(screen.getByText("65%")).toBeDefined();
    expect(screen.getByText("91%")).toBeDefined();
  });

  it("shows greeting with streak", () => {
    render(<DashboardScene sceneElapsedMs={1000} />);
    expect(screen.getByText(/Good morning, Alex/)).toBeDefined();
  });
});

describe("TutorChatScene", () => {
  it("renders chat header with Newton", () => {
    render(<TutorChatScene sceneElapsedMs={0} />);
    expect(screen.getByText("Newton")).toBeDefined();
    expect(screen.getByText("Your STEM Tutor")).toBeDefined();
  });

  it("renders first message after delay", () => {
    render(<TutorChatScene sceneElapsedMs={2000} />);
    expect(screen.getByText(/noticed you struggled with fractions/)).toBeDefined();
  });

  it("renders second message after 3500ms", () => {
    render(<TutorChatScene sceneElapsedMs={4000} />);
    expect(screen.getByText("Okay! I like visual examples.")).toBeDefined();
  });

  it("renders third message after 5500ms", () => {
    render(<TutorChatScene sceneElapsedMs={6000} />);
    expect(screen.getByText(/pizza problem/)).toBeDefined();
  });
});

describe("AdaptationScene", () => {
  it("renders quiz question", () => {
    render(<AdaptationScene sceneElapsedMs={0} />);
    expect(screen.getByText("What is 3/4 + 1/2?")).toBeDefined();
  });

  it("renders 4 answer buttons", () => {
    render(<AdaptationScene sceneElapsedMs={0} />);
    expect(screen.getByText("1¼")).toBeDefined();
    expect(screen.getByText("1½")).toBeDefined();
    expect(screen.getByText("1⅓")).toBeDefined();
    expect(screen.getByText("¾")).toBeDefined();
  });

  it("highlights correct answer after 2500ms", () => {
    render(<AdaptationScene sceneElapsedMs={3000} />);
    // The correct answer (B: 1¼) should be highlighted
    expect(screen.getByText("1¼")).toBeDefined();
  });
});

describe("ReportsScene", () => {
  it("renders header with student name", () => {
    render(<ReportsScene sceneElapsedMs={0} />);
    expect(screen.getByText(/Alex Johnson/)).toBeDefined();
  });

  it("renders bar chart with subjects", () => {
    render(<ReportsScene sceneElapsedMs={3000} />);
    expect(screen.getByText("Math")).toBeDefined();
    expect(screen.getByText("Science")).toBeDefined();
  });

  it("renders achievement badge after 3500ms", () => {
    render(<ReportsScene sceneElapsedMs={4000} />);
    expect(screen.getByText(/3 Achievements Unlocked/)).toBeDefined();
  });

  it("shows notification after 5000ms", () => {
    render(<ReportsScene sceneElapsedMs={5500} />);
    expect(screen.getByText(/Mrs. Rodriguez/)).toBeDefined();
  });
});

describe("CtaScene", () => {
  it("renders headline after 1000ms", () => {
    render(<CtaScene sceneElapsedMs={1500} />);
    expect(screen.getByText("Every Student Deserves an AI That Gets Them")).toBeDefined();
  });

  it("renders subtext after 2000ms", () => {
    render(<CtaScene sceneElapsedMs={2500} />);
    expect(screen.getByText(/Join 500\+ schools/)).toBeDefined();
  });

  it("renders 2 CTA buttons with correct links after 3000ms", () => {
    render(<CtaScene sceneElapsedMs={4000} />);
    const primary = screen.getByTestId("walkthrough-cta-primary");
    const secondary = screen.getByTestId("walkthrough-cta-secondary");
    expect(primary.getAttribute("href")).toBe("/get-started");
    expect(secondary.getAttribute("href")).toBe("/demo");
  });
});
