import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DemoPageClient } from "@/app/demo/client";

/* ------------------------------------------------------------------ */
/* Mocks                                                               */
/* ------------------------------------------------------------------ */

// Arabic demo translations
const arDemo: Record<string, string> = {
  title: "شاهد AIVO في العمل",
  subtitle: "احجز عرضاً توضيحياً مخصصاً مجانياً لمدة 30 دقيقة",
  step1Title: "أخبرنا عن نفسك",
  step2Title: "اختر موعداً",
  step3Title: "أنت جاهز!",
  nameLabel: "الاسم",
  emailLabel: "البريد الإلكتروني",
  orgLabel: "المؤسسة",
  roleLabel: "الدور",
  studentsLabel: "عدد الطلاب",
  continue: "متابعة",
  back: "رجوع",
  select: "اختر...",
  sidebarTitle: "شاهد Aivo في العمل",
  sidebarSubtitle: "احجز عرضاً توضيحياً مخصصاً مجانياً لمدة 30 دقيقة",
  bullet1: "جولة مخصصة لمدة 30 دقيقة في المنصة",
  bullet2: "شاهد كيف يتكيف Brain Clone AI مع كل طالب",
  bullet3: "احصل على إجابات لجميع أسئلتك",
  preferEmail: "تفضل البريد الإلكتروني؟",
  reachUs: "تواصل معنا عبر",
  hiGreeting: "مرحباً {name}، اختر موعداً مناسباً لعرضك التوضيحي المخصص.",
  stepOf: "الخطوة {current} من 3",
  backToHome: "العودة إلى الرئيسية",
  nameRequired: "الاسم مطلوب",
  emailRequired: "البريد الإلكتروني مطلوب",
  emailInvalid: "يرجى إدخال بريد إلكتروني صالح",
};

const mockT = vi.fn((_section: string, key: string) => arDemo[key] ?? key);

vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "ar",
    messages: null,
    t: mockT,
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
    h1: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <h1 {...props}>{children}</h1>,
    p: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn(), demoRequest: vi.fn() },
}));

// Mock leads-api
vi.mock("@/lib/leads-api", () => ({
  submitLead: vi.fn().mockResolvedValue({}),
}));

// Mock booking components
vi.mock("@/components/booking/oonrumail-calendar", () => ({
  OonrumailCalendar: () => <div data-testid="calendar" />,
}));
vi.mock("@/components/booking/booking-confirmation-card", () => ({
  BookingConfirmationCard: () => <div data-testid="confirmation-card" />,
}));
vi.mock("@/components/booking/booking-fallback-form", () => ({
  BookingFallbackForm: () => <div data-testid="fallback-form" />,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ArrowLeft: () => <span data-testid="arrow-left" />,
  ArrowRight: () => <span data-testid="arrow-right" />,
}));

// Mock cn utility
vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("Demo page i18n (Arabic)", () => {
  beforeEach(() => {
    cleanup();
    mockT.mockImplementation((_section: string, key: string) => arDemo[key] ?? key);
  });

  it("renders Arabic page title and subtitle", () => {
    render(<DemoPageClient />);

    expect(screen.getByText("شاهد AIVO في العمل")).toBeTruthy();
    // subtitle appears in both hero and sidebar; verify at least one renders
    expect(
      screen.getAllByText("احجز عرضاً توضيحياً مخصصاً مجانياً لمدة 30 دقيقة").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders Arabic form labels on Step 1", () => {
    render(<DemoPageClient />);

    expect(screen.getByText("الاسم")).toBeTruthy();
    expect(screen.getByText("البريد الإلكتروني")).toBeTruthy();
    expect(screen.getByText("المؤسسة")).toBeTruthy();
    expect(screen.getByText("الدور")).toBeTruthy();
    expect(screen.getByText("عدد الطلاب")).toBeTruthy();
  });

  it("renders Arabic continue button and step title", () => {
    render(<DemoPageClient />);

    expect(screen.getByText("متابعة")).toBeTruthy();
    expect(screen.getByText("أخبرنا عن نفسك")).toBeTruthy();
  });

  it("renders Arabic sidebar title and bullet points", () => {
    render(<DemoPageClient />);

    expect(screen.getByText("شاهد Aivo في العمل")).toBeTruthy();
    expect(
      screen.getByText("جولة مخصصة لمدة 30 دقيقة في المنصة"),
    ).toBeTruthy();
    expect(
      screen.getByText("شاهد كيف يتكيف Brain Clone AI مع كل طالب"),
    ).toBeTruthy();
    expect(
      screen.getByText("احصل على إجابات لجميع أسئلتك"),
    ).toBeTruthy();
  });

  it("renders Arabic step indicator labels", () => {
    render(<DemoPageClient />);

    expect(screen.getByText("الخطوة 1 من 3")).toBeTruthy();
    expect(screen.getByText("الخطوة 2 من 3")).toBeTruthy();
    expect(screen.getByText("الخطوة 3 من 3")).toBeTruthy();
  });

  it("shows Arabic validation errors on empty submit", () => {
    render(<DemoPageClient />);

    const submitBtn = screen.getByText("متابعة");
    fireEvent.click(submitBtn);

    expect(screen.getByText("الاسم مطلوب")).toBeTruthy();
    expect(screen.getByText("البريد الإلكتروني مطلوب")).toBeTruthy();
  });

  it("shows Arabic email-invalid error for bad email", () => {
    render(<DemoPageClient />);

    const nameInput = screen.getByLabelText(/الاسم/);
    fireEvent.change(nameInput, { target: { value: "أحمد" } });

    const emailInput = screen.getByLabelText(/البريد الإلكتروني/);
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });

    const submitBtn = screen.getByText("متابعة");
    fireEvent.click(submitBtn);

    expect(screen.getByText("يرجى إدخال بريد إلكتروني صالح")).toBeTruthy();
  });

  it("renders Arabic select placeholder", () => {
    render(<DemoPageClient />);

    const selectElement = screen.getByRole("combobox", { name: /الدور/ }) as HTMLSelectElement;
    const placeholderOption = selectElement.querySelector("option[disabled]");
    expect(placeholderOption?.textContent).toBe("اختر...");
  });
});
