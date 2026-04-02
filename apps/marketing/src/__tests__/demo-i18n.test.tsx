import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const arMessages: Record<string, Record<string, string>> = {
  nav: { features: "المميزات" },
  hero: { headline: "" },
  features: { title: "" },
  howItWorks: { title: "" },
  aiTutors: { title: "" },
  pricing: { title: "" },
  cta: { headline: "" },
  contact: { title: "" },
  footer: { copyright: "" },
  common: { backToHome: "العودة إلى الرئيسية" },
  demo: {
    title: "شاهد AIVO في العمل",
    subtitle: "حدد موعداً لعرض توضيحي مخصص مع فريقنا التعليمي.",
    successTitle: "شكراً لك!",
    successMessage: "سيتواصل معك فريقنا خلال 24 ساعة.",
    step1Title: "أخبرنا عن نفسك",
    step2Title: "اختر موعداً",
    step3Title: "كل شيء جاهز!",
    nameLabel: "الاسم",
    emailLabel: "البريد الإلكتروني",
    orgLabel: "المؤسسة",
    roleLabel: "الدور",
    studentsLabel: "عدد الطلاب",
    continue: "متابعة",
    back: "رجوع",
    sidebarTitle: "شاهد Aivo في العمل",
    sidebarSubtitle: "احجز عرضاً توضيحياً مجانياً لمدة 30 دقيقة",
    bullet1: "جولة شخصية مدتها 30 دقيقة في المنصة",
    bullet2: "اكتشف كيف يتكيف Brain Clone AI مع كل طالب",
    bullet3: "احصل على إجابات لجميع أسئلتك",
    preferEmail: "تفضل البريد الإلكتروني؟",
    emailAddress: "تواصل معنا على",
  },
};

function makeT(msgs: Record<string, Record<string, string>>) {
  return (key: string): string => {
    const parts = key.split(".");
    let current: any = msgs;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return key;
      current = current[part];
    }
    return typeof current === "string" ? current : key;
  };
}

vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "ar",
    messages: arMessages,
    t: makeT(arMessages),
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
}));

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

vi.mock("framer-motion", () => {
  const React = require("react");
  const MotionDiv = React.forwardRef(
    ({ children, ...props }: any, ref: any) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className" || k === "style")
          safe[k] = v;
      }
      return (
        <div ref={ref} {...safe}>
          {children}
        </div>
      );
    },
  );
  MotionDiv.displayName = "MotionDiv";
  return {
    motion: { div: MotionDiv, h1: MotionDiv, p: MotionDiv },
    AnimatePresence: ({ children }: any) => children,
  };
});

vi.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ArrowLeft: () => <span data-testid="arrow-left" />,
  ArrowRight: () => <span data-testid="arrow-right" />,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/lib/leads-api", () => ({
  submitLead: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn(), demoRequest: vi.fn() },
}));

vi.mock("@/components/booking/oonrumail-calendar", () => ({
  OonrumailCalendar: () => <div data-testid="calendar" />,
}));

vi.mock("@/components/booking/booking-confirmation-card", () => ({
  BookingConfirmationCard: () => <div data-testid="confirmation" />,
}));

vi.mock("@/components/booking/booking-fallback-form", () => ({
  BookingFallbackForm: () => <div data-testid="fallback" />,
}));

import { DemoPageClient } from "@/app/demo/client";

describe("DemoPageClient with Arabic translations", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders the page title in Arabic", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("شاهد AIVO في العمل")).toBeInTheDocument();
  });

  it("renders form labels in Arabic", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("الاسم")).toBeInTheDocument();
    expect(screen.getByText("البريد الإلكتروني")).toBeInTheDocument();
    expect(screen.getByText("المؤسسة")).toBeInTheDocument();
    expect(screen.getByText("الدور")).toBeInTheDocument();
    expect(screen.getByText("عدد الطلاب")).toBeInTheDocument();
  });

  it("renders sidebar bullets in Arabic", () => {
    render(<DemoPageClient />);
    expect(
      screen.getAllByText("جولة شخصية مدتها 30 دقيقة في المنصة").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("اكتشف كيف يتكيف Brain Clone AI مع كل طالب").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("احصل على إجابات لجميع أسئلتك").length,
    ).toBeGreaterThan(0);
  });

  it("renders sidebar title and subtitle in Arabic", () => {
    render(<DemoPageClient />);
    expect(screen.getAllByText("شاهد Aivo في العمل").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("احجز عرضاً توضيحياً مجانياً لمدة 30 دقيقة").length,
    ).toBeGreaterThan(0);
  });

  it("renders step titles in Arabic", () => {
    render(<DemoPageClient />);
    // Step title appears in both the step indicator and the h2 heading
    expect(screen.getAllByText("أخبرنا عن نفسك").length).toBeGreaterThan(0);
  });

  it("renders continue button in Arabic", () => {
    render(<DemoPageClient />);
    expect(screen.getAllByText("متابعة").length).toBeGreaterThan(0);
  });

  it("renders prefer email section in Arabic", () => {
    render(<DemoPageClient />);
    expect(screen.getAllByText("تفضل البريد الإلكتروني؟").length).toBeGreaterThan(0);
  });
});
