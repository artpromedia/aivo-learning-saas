import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { I18nProvider, useI18n } from "@/providers/i18n-provider";

/* ------------------------------------------------------------------ */
/* Mocks                                                               */
/* ------------------------------------------------------------------ */

const mockUseLocale = vi.fn(() => "en");
const mockUseTranslations = vi.fn(() => null as any);

vi.mock("@/lib/i18n", () => ({
  useLocale: (...args: unknown[]) => mockUseLocale(...(args as [])),
  useTranslations: (...args: unknown[]) => mockUseTranslations(...(args as [])),
}));

/* ------------------------------------------------------------------ */
/* Helper: consumer that exposes context values                        */
/* ------------------------------------------------------------------ */

function Consumer() {
  const { locale, messages, t } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="has-messages">{messages ? "yes" : "no"}</span>
      <span data-testid="t-nav-features">{t("nav", "features")}</span>
      <span data-testid="t-missing">{t("nav", "nonexistent")}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("I18nProvider", () => {
  beforeEach(() => {
    cleanup();
    mockUseLocale.mockReturnValue("en");
    mockUseTranslations.mockReturnValue(null);
  });

  it("provides the current locale from useLocale()", () => {
    mockUseLocale.mockReturnValue("fr");

    render(
      <I18nProvider>
        <Consumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId("locale").textContent).toBe("fr");
  });

  it("t() returns the key when messages are null (fallback)", () => {
    render(
      <I18nProvider>
        <Consumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId("t-nav-features").textContent).toBe("features");
    expect(screen.getByTestId("t-missing").textContent).toBe("nonexistent");
  });

  it("t() returns the translated value when messages are loaded", () => {
    mockUseLocale.mockReturnValue("es");
    mockUseTranslations.mockReturnValue({
      nav: { features: "Funciones", login: "Iniciar Sesión" },
    });

    render(
      <I18nProvider>
        <Consumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId("t-nav-features").textContent).toBe("Funciones");
  });

  it("t() falls back to key for missing section/key even when messages exist", () => {
    mockUseTranslations.mockReturnValue({
      nav: { features: "Funciones" },
    });

    render(
      <I18nProvider>
        <Consumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId("t-missing").textContent).toBe("nonexistent");
  });

  it("defaults to locale 'en' and null messages outside a provider", () => {
    render(<Consumer />);

    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("has-messages").textContent).toBe("no");
    expect(screen.getByTestId("t-nav-features").textContent).toBe("features");
  });
});
