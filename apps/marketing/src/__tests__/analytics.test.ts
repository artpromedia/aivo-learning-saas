import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Analytics Event Tracking", () => {
  beforeEach(() => {
    (globalThis as any).window = {
      plausible: vi.fn(),
    };
  });

  it("should call plausible with event name and props", async () => {
    const { trackEvent } = await import("../lib/analytics");
    trackEvent("Test Event", { key: "value" });
    expect((globalThis as any).window.plausible).toHaveBeenCalledWith(
      "Test Event",
      { props: { key: "value" } },
    );
  });

  it("should handle missing plausible gracefully", async () => {
    (globalThis as any).window = {};
    const { trackEvent } = await import("../lib/analytics");
    expect(() => trackEvent("Test Event")).not.toThrow();
  });
});

describe("UTM Attribution", () => {
  beforeEach(() => {
    (globalThis as any).window = {
      location: { search: "?utm_source=google&utm_medium=cpc&utm_campaign=spring2026", pathname: "/pricing" },
      sessionStorage: {
        _store: {} as Record<string, string>,
        getItem(key: string) { return this._store[key] ?? null; },
        setItem(key: string, val: string) { this._store[key] = val; },
      },
      document: { referrer: "https://google.com" },
    };
    (globalThis as any).document = { referrer: "https://google.com" };
    (globalThis as any).sessionStorage = (globalThis as any).window.sessionStorage;
  });

  it("should capture UTM params from URL", async () => {
    const { captureUtmParams, getUtmParams } = await import("../lib/utm");
    captureUtmParams();
    const params = getUtmParams();
    expect(params.utm_source).toBe("google");
    expect(params.utm_medium).toBe("cpc");
    expect(params.utm_campaign).toBe("spring2026");
  });

  it("should persist UTM params in sessionStorage", async () => {
    const { captureUtmParams } = await import("../lib/utm");
    captureUtmParams();
    const stored = (globalThis as any).window.sessionStorage.getItem("aivo_utm");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed.utm_source).toBe("google");
  });

  it("should attach UTM to payloads", async () => {
    const { captureUtmParams, attachUtmToPayload } = await import("../lib/utm");
    captureUtmParams();
    const enriched = attachUtmToPayload({ contactEmail: "test@test.com" });
    expect(enriched.utmParams).toBeDefined();
    expect(enriched.contactEmail).toBe("test@test.com");
  });
});
