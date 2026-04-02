import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

let mockLocale = "en";

vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: mockLocale,
    messages: null,
    t: (key: string) => key,
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { HtmlLangSetter } from "@/components/layout/html-lang-setter";

describe("HtmlLangSetter RTL support", () => {
  beforeEach(() => {
    cleanup();
    document.documentElement.lang = "";
    document.documentElement.dir = "";
    document.documentElement.classList.remove("rtl");
  });

  it("sets dir='rtl', lang='ar', and 'rtl' class for Arabic locale", () => {
    mockLocale = "ar";
    render(<HtmlLangSetter />);
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.classList.contains("rtl")).toBe(true);
  });

  it("sets dir='ltr', lang='en', and no 'rtl' class for English locale", () => {
    mockLocale = "en";
    render(<HtmlLangSetter />);
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.classList.contains("rtl")).toBe(false);
  });

  it("removes 'rtl' class when switching from Arabic to English", () => {
    mockLocale = "ar";
    const { unmount } = render(<HtmlLangSetter />);
    expect(document.documentElement.classList.contains("rtl")).toBe(true);
    unmount();

    mockLocale = "en";
    render(<HtmlLangSetter />);
    expect(document.documentElement.classList.contains("rtl")).toBe(false);
    expect(document.documentElement.dir).toBe("ltr");
  });
});
