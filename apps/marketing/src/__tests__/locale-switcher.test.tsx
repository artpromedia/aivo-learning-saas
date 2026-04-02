import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

/* ------------------------------------------------------------------ */
/* Mocks                                                               */
/* ------------------------------------------------------------------ */

vi.mock("lucide-react", () => ({
  Globe: (props: Record<string, unknown>) => (
    <svg data-testid="globe-icon" {...props} />
  ),
}));

// Capture cookie writes and reload calls
let mockCookieValue = "";
const reloadMock = vi.fn();

beforeEach(() => {
  mockCookieValue = "";
  reloadMock.mockClear();

  // Mock document.cookie
  Object.defineProperty(document, "cookie", {
    get: () => mockCookieValue,
    set: (val: string) => {
      // Accumulate cookies like a real browser
      const name = val.split("=")[0];
      const existing = mockCookieValue
        .split("; ")
        .filter((c) => !c.startsWith(`${name}=`));
      const newEntry = val.split(";")[0]; // strip path/max-age
      existing.push(newEntry);
      mockCookieValue = existing.filter(Boolean).join("; ");
    },
    configurable: true,
  });

  // Mock window.location.reload
  Object.defineProperty(window, "location", {
    value: { ...window.location, reload: reloadMock },
    writable: true,
    configurable: true,
  });
});

import { LocaleSwitcher } from "@/components/layout/locale-switcher";

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("LocaleSwitcher", () => {
  it("renders the globe button with correct aria-label", () => {
    render(<LocaleSwitcher />);
    const btn = screen.getByLabelText("Change language");
    expect(btn).toBeDefined();
    expect(screen.getByTestId("globe-icon")).toBeDefined();
  });

  it("dropdown is closed by default", () => {
    render(<LocaleSwitcher />);
    // No locale options visible
    expect(screen.queryByText("Español")).toBeNull();
  });

  it("clicking the globe button opens the dropdown", () => {
    render(<LocaleSwitcher />);
    const btn = screen.getByLabelText("Change language");
    fireEvent.click(btn);

    expect(screen.getByText("English")).toBeDefined();
    expect(screen.getByText("Español")).toBeDefined();
  });

  it("lists all 10 locales with correct labels and flags", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByLabelText("Change language"));

    const expected = [
      { label: "English", flag: "🇺🇸" },
      { label: "Español", flag: "🇪🇸" },
      { label: "Français", flag: "🇫🇷" },
      { label: "العربية", flag: "🇸🇦" },
      { label: "中文", flag: "🇨🇳" },
      { label: "Português", flag: "🇧🇷" },
      { label: "Kiswahili", flag: "🇰🇪" },
      { label: "Asụsụ Igbo", flag: "🇳🇬" },
      { label: "Èdè Yorùbá", flag: "🇳🇬" },
      { label: "Hausa", flag: "🇳🇬" },
    ];

    for (const { label, flag } of expected) {
      const btn = screen.getByText(label);
      expect(btn).toBeDefined();
      // The flag should be a sibling span in the same button
      const parent = btn.closest("button");
      expect(parent?.textContent).toContain(flag);
    }
  });

  it("clicking a locale sets the NEXT_LOCALE cookie", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByLabelText("Change language"));
    fireEvent.click(screen.getByText("Español"));

    expect(mockCookieValue).toContain("NEXT_LOCALE=es");
  });

  it("clicking a locale calls window.location.reload", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByLabelText("Change language"));
    fireEvent.click(screen.getByText("Français"));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("clicking a locale closes the dropdown", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByLabelText("Change language"));
    expect(screen.getByText("Español")).toBeDefined();

    fireEvent.click(screen.getByText("Español"));

    // After switchLocale runs, open is set to false before reload.
    // The dropdown should no longer be present.
    expect(screen.queryByText("Français")).toBeNull();
  });

  it("clicking outside the dropdown closes it", () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByLabelText("Change language"));
    expect(screen.getByText("English")).toBeDefined();

    // Fire mousedown on the document body (outside the component)
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("Español")).toBeNull();
  });

  it("aria-expanded reflects dropdown state", () => {
    render(<LocaleSwitcher />);
    const btn = screen.getByLabelText("Change language");

    expect(btn.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("highlights the current locale in the dropdown", () => {
    // Default is English (no cookie set)
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByLabelText("Change language"));

    const englishBtn = screen.getByText("English").closest("button");
    expect(englishBtn?.className).toContain("font-medium");
  });

  it("supports light and dark variants", () => {
    const { unmount } = render(<LocaleSwitcher variant="dark" />);
    const btn = screen.getByLabelText("Change language");
    expect(btn.className).toContain("text-aivo-navy-600");
    unmount();

    render(<LocaleSwitcher variant="light" />);
    const btnLight = screen.getByLabelText("Change language");
    expect(btnLight.className).toContain("text-white");
  });
});
