import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Spanish messages for the nav
const esMessages = {
  nav: {
    features: "Funciones",
    pricing: "Precios",
    about: "Nosotros",
    blog: "Blog",
    howItWorks: "Cómo Funciona",
    tutors: "Tutores IA",
    login: "Iniciar Sesión",
    getStarted: "Empezar Gratis",
  },
  hero: { headline: "" },
  features: { title: "" },
  howItWorks: { title: "" },
  aiTutors: { title: "" },
  pricing: { title: "" },
  cta: { headline: "" },
  demo: { title: "" },
  contact: { title: "" },
  footer: { copyright: "" },
  common: { learnMore: "" },
};

// Mock the i18n provider to return Spanish translations
vi.mock("@/providers/i18n-provider", () => {
  const t = (key: string): string => {
    const parts = key.split(".");
    let current: any = esMessages;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return key;
      current = current[part];
    }
    return typeof current === "string" ? current : key;
  };

  return {
    useI18n: () => ({
      locale: "es",
      messages: esMessages,
      t,
    }),
    I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock next/link as a simple anchor
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: any;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Menu: () => <span data-testid="menu-icon" />,
  X: () => <span data-testid="x-icon" />,
  Globe: () => <span data-testid="globe-icon" />,
}));

// Mock cn utility
vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

import { Nav } from "@/components/layout/nav";

describe("Nav with Spanish translations", () => {
  it("renders Spanish nav link text instead of English", () => {
    render(<Nav />);
    expect(screen.getAllByText("Funciones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Empezar Gratis").length).toBeGreaterThan(0);
  });

  it("does not render English text", () => {
    render(<Nav />);
    expect(screen.queryByText("Features")).not.toBeInTheDocument();
    expect(screen.queryByText("Get Started Free")).not.toBeInTheDocument();
  });

  it("renders the LocaleSwitcher with the globe icon button", () => {
    render(<Nav />);
    const changeLangButtons = screen.getAllByLabelText("Change language");
    expect(changeLangButtons.length).toBeGreaterThan(0);
  });
});
