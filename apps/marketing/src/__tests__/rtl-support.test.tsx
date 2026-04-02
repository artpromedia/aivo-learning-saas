import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { HtmlLangSetter } from "@/components/layout/html-lang-setter";

/* ------------------------------------------------------------------ */
/* Mocks                                                               */
/* ------------------------------------------------------------------ */

let mockLocale = "en";

vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: mockLocale,
    messages: null,
    t: (_section: string, key: string) => key,
  }),
}));

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("RTL support — HtmlLangSetter", () => {
  beforeEach(() => {
    cleanup();
    // Reset html element attributes
    document.documentElement.lang = "";
    document.documentElement.dir = "";
    document.documentElement.classList.remove("rtl");
  });

  it("sets dir='rtl', lang='ar', and class 'rtl' for Arabic locale", () => {
    mockLocale = "ar";
    render(<HtmlLangSetter />);

    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.classList.contains("rtl")).toBe(true);
  });

  it("sets dir='ltr', lang='en', and removes 'rtl' class for English locale", () => {
    // Pre-set rtl class to verify removal
    document.documentElement.classList.add("rtl");

    mockLocale = "en";
    render(<HtmlLangSetter />);

    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.classList.contains("rtl")).toBe(false);
  });

  it("sets dir='ltr' for non-RTL locales (French)", () => {
    mockLocale = "fr";
    render(<HtmlLangSetter />);

    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("fr");
    expect(document.documentElement.classList.contains("rtl")).toBe(false);
  });

  it("sets dir='ltr' for Swahili locale", () => {
    mockLocale = "sw";
    render(<HtmlLangSetter />);

    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("sw");
  });
});
