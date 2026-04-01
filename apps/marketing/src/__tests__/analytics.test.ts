import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { renderHook } from "@testing-library/react";

// ─── Plausible Analytics Events ─────────────────────────────────────────────────

describe("trackEvent", () => {
  beforeEach(() => {
    vi.resetModules();
    window.plausible = vi.fn();
  });

  afterEach(() => {
    delete window.plausible;
  });

  it("calls window.plausible with the event name and props", async () => {
    const { trackEvent } = await import("../lib/analytics");
    trackEvent("Test Event", { key: "value" });
    expect(window.plausible).toHaveBeenCalledWith("Test Event", {
      props: { key: "value" },
    });
  });

  it("does not throw when window.plausible is undefined", async () => {
    delete window.plausible;
    const { trackEvent } = await import("../lib/analytics");
    expect(() => trackEvent("Missing")).not.toThrow();
  });
});

describe("events", () => {
  let plausibleSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    plausibleSpy = vi.fn();
    window.plausible = plausibleSpy;
  });

  afterEach(() => {
    delete window.plausible;
  });

  async function getEvents() {
    return (await import("../lib/analytics")).events;
  }

  it("signupClick sends correct event", async () => {
    (await getEvents()).signupClick("nav");
    expect(plausibleSpy).toHaveBeenCalledWith("Signup Click", {
      props: { source: "nav" },
    });
  });

  it("demoRequest sends correct event", async () => {
    (await getEvents()).demoRequest(500);
    expect(plausibleSpy).toHaveBeenCalledWith("Demo Request", {
      props: { districtSize: 500 },
    });
  });

  it("demoRequest defaults districtSize to 0", async () => {
    (await getEvents()).demoRequest();
    expect(plausibleSpy).toHaveBeenCalledWith("Demo Request", {
      props: { districtSize: 0 },
    });
  });

  it("demoBookingStarted sends correct event", async () => {
    (await getEvents()).demoBookingStarted("hero");
    expect(plausibleSpy).toHaveBeenCalledWith("Demo Booking Started", {
      props: { source: "hero" },
    });
  });

  it("demoBookingCompleted sends correct event", async () => {
    (await getEvents()).demoBookingCompleted("hero", "2026-04-01T10:00");
    expect(plausibleSpy).toHaveBeenCalledWith("Demo Booking Completed", {
      props: { source: "hero", timeSlot: "2026-04-01T10:00" },
    });
  });

  it("videoWalkthroughStarted sends correct event", async () => {
    (await getEvents()).videoWalkthroughStarted("product-page");
    expect(plausibleSpy).toHaveBeenCalledWith("Video Walkthrough Started", {
      props: { source: "product-page" },
    });
  });

  it("videoWalkthroughCompleted sends correct event", async () => {
    (await getEvents()).videoWalkthroughCompleted("product-page", 45000);
    expect(plausibleSpy).toHaveBeenCalledWith("Video Walkthrough Completed", {
      props: { source: "product-page", watchTimeMs: 45000 },
    });
  });

  it("videoWalkthroughMilestone sends correct event", async () => {
    (await getEvents()).videoWalkthroughMilestone("homepage", 50);
    expect(plausibleSpy).toHaveBeenCalledWith("Video Walkthrough Milestone", {
      props: { source: "homepage", percent: 50 },
    });
  });

  it("scrollDepth sends correct event", async () => {
    (await getEvents()).scrollDepth(75);
    expect(plausibleSpy).toHaveBeenCalledWith("Scroll Depth", {
      props: { percent: 75 },
    });
  });

  it("timeOnPage sends correct event", async () => {
    (await getEvents()).timeOnPage(60);
    expect(plausibleSpy).toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 60 },
    });
  });

  it("newsletterSubscribed sends correct event", async () => {
    (await getEvents()).newsletterSubscribed("footer");
    expect(plausibleSpy).toHaveBeenCalledWith("Newsletter Subscribed", {
      props: { source: "footer" },
    });
  });

  it("pricingToggle sends correct event", async () => {
    (await getEvents()).pricingToggle("annual");
    expect(plausibleSpy).toHaveBeenCalledWith("Pricing Toggle", {
      props: { billingCycle: "annual" },
    });
  });

  it("ctaClicked sends correct event", async () => {
    (await getEvents()).ctaClicked("hero-cta", "above-fold");
    expect(plausibleSpy).toHaveBeenCalledWith("CTA Clicked", {
      props: { ctaId: "hero-cta", location: "above-fold" },
    });
  });

  it("pricingView sends correct event", async () => {
    (await getEvents()).pricingView("pro");
    expect(plausibleSpy).toHaveBeenCalledWith("Pricing View", {
      props: { plan: "pro" },
    });
  });

  it("tutorExplore sends correct event", async () => {
    (await getEvents()).tutorExplore("math");
    expect(plausibleSpy).toHaveBeenCalledWith("Tutor Explore", {
      props: { tutor: "math" },
    });
  });

  it("exitIntentCapture sends correct event", async () => {
    (await getEvents()).exitIntentCapture();
    expect(plausibleSpy).toHaveBeenCalledWith("Exit Intent Capture", {
      props: undefined,
    });
  });

  it("faqExpand sends correct event", async () => {
    (await getEvents()).faqExpand("how-it-works");
    expect(plausibleSpy).toHaveBeenCalledWith("FAQ Expand", {
      props: { question: "how-it-works" },
    });
  });

  it("blogRead sends correct event", async () => {
    (await getEvents()).blogRead("intro-to-ai-tutors");
    expect(plausibleSpy).toHaveBeenCalledWith("Blog Read", {
      props: { slug: "intro-to-ai-tutors" },
    });
  });

  it("contactSubmit sends correct event", async () => {
    (await getEvents()).contactSubmit("partnership");
    expect(plausibleSpy).toHaveBeenCalledWith("Contact Submit", {
      props: { subject: "partnership" },
    });
  });

  it("experimentExposed sends correct event", async () => {
    (await getEvents()).experimentExposed("hero-v1", "variant-b");
    expect(plausibleSpy).toHaveBeenCalledWith("Experiment Exposed", {
      props: { experiment: "hero-v1", variant: "variant-b" },
    });
  });

  it("experimentConverted sends correct event", async () => {
    (await getEvents()).experimentConverted("hero-v1", "variant-b");
    expect(plausibleSpy).toHaveBeenCalledWith("Experiment Converted", {
      props: { experiment: "hero-v1", variant: "variant-b" },
    });
  });
});

// ─── useScrollDepthTracker ──────────────────────────────────────────────────────

describe("useScrollDepthTracker", () => {
  let plausibleSpy: ReturnType<typeof vi.fn>;
  let scrollListeners: Array<() => void>;
  let rafQueue: Array<FrameRequestCallback>;

  beforeEach(() => {
    vi.resetModules();
    plausibleSpy = vi.fn();
    window.plausible = plausibleSpy;
    scrollListeners = [];
    rafQueue = [];

    // Capture scroll listeners so we can fire them manually
    vi.spyOn(window, "addEventListener").mockImplementation(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        if (event === "scroll" && typeof handler === "function") {
          scrollListeners.push(handler);
        }
      },
    );
    vi.spyOn(window, "removeEventListener").mockImplementation(() => {});

    // Defer rAF callbacks so the return value is assigned to rafRef.current
    // before the callback executes (mirrors real browser behavior).
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        rafQueue.push(cb);
        return rafQueue.length;
      },
    );
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    delete window.plausible;
    vi.restoreAllMocks();
  });

  /** Flush all pending rAF callbacks (like the browser painting a frame). */
  function flushRaf(): void {
    while (rafQueue.length > 0) {
      const cb = rafQueue.shift()!;
      cb(performance.now());
    }
  }

  function simulateScroll(scrollY: number, scrollHeight: number): void {
    Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: scrollHeight,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });

    for (const listener of scrollListeners) {
      listener();
    }
    flushRaf();
  }

  it("fires scrollDepth at 25%, 50%, 75%, 100% thresholds", async () => {
    const { useScrollDepthTracker } = await import(
      "../lib/scroll-depth-tracker"
    );

    // Total scrollable distance = scrollHeight - innerHeight = 4800 - 800 = 4000
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 4800,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });

    renderHook(() => useScrollDepthTracker());
    // Flush the initial onScroll() rAF from mount (scrollY=0, fires nothing)
    flushRaf();

    // 25% of 4000 = 1000
    simulateScroll(1000, 4800);
    expect(plausibleSpy).toHaveBeenCalledWith("Scroll Depth", {
      props: { percent: 25 },
    });

    // 50% of 4000 = 2000
    simulateScroll(2000, 4800);
    expect(plausibleSpy).toHaveBeenCalledWith("Scroll Depth", {
      props: { percent: 50 },
    });

    // 75% of 4000 = 3000
    simulateScroll(3000, 4800);
    expect(plausibleSpy).toHaveBeenCalledWith("Scroll Depth", {
      props: { percent: 75 },
    });

    // 100% = 4000
    simulateScroll(4000, 4800);
    expect(plausibleSpy).toHaveBeenCalledWith("Scroll Depth", {
      props: { percent: 100 },
    });
  });

  it("fires each threshold only once", async () => {
    const { useScrollDepthTracker } = await import(
      "../lib/scroll-depth-tracker"
    );

    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 4800,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });

    renderHook(() => useScrollDepthTracker());
    flushRaf();

    // Scroll past 25% twice
    simulateScroll(1200, 4800);
    simulateScroll(1200, 4800);

    const calls25 = plausibleSpy.mock.calls.filter(
      (c: [string, { props?: Record<string, number> }]) =>
        c[0] === "Scroll Depth" && c[1]?.props?.percent === 25,
    );
    expect(calls25).toHaveLength(1);
  });

  it("cleans up scroll listener on unmount", async () => {
    const { useScrollDepthTracker } = await import(
      "../lib/scroll-depth-tracker"
    );

    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 4800,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });

    const { unmount } = renderHook(() => useScrollDepthTracker());
    flushRaf();
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });
});

// ─── useTimeOnPageTracker ───────────────────────────────────────────────────────

describe("useTimeOnPageTracker", () => {
  let plausibleSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    plausibleSpy = vi.fn();
    window.plausible = plausibleSpy;

    // Ensure the tab is "visible" by default
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete window.plausible;
  });

  it("fires timeOnPage at 30s, 60s, 120s, 300s", async () => {
    const { useTimeOnPageTracker } = await import(
      "../lib/time-on-page-tracker"
    );
    renderHook(() => useTimeOnPageTracker());

    vi.advanceTimersByTime(30_000);
    expect(plausibleSpy).toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 30 },
    });

    vi.advanceTimersByTime(30_000); // 60s total
    expect(plausibleSpy).toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 60 },
    });

    vi.advanceTimersByTime(60_000); // 120s total
    expect(plausibleSpy).toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 120 },
    });

    vi.advanceTimersByTime(180_000); // 300s total
    expect(plausibleSpy).toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 300 },
    });
  });

  it("fires each threshold only once", async () => {
    const { useTimeOnPageTracker } = await import(
      "../lib/time-on-page-tracker"
    );
    renderHook(() => useTimeOnPageTracker());

    vi.advanceTimersByTime(35_000); // past 30s

    const calls30 = plausibleSpy.mock.calls.filter(
      (c: [string, { props?: Record<string, number> }]) =>
        c[0] === "Time on Page" && c[1]?.props?.seconds === 30,
    );
    expect(calls30).toHaveLength(1);
  });

  it("pauses when tab is hidden and resumes when visible", async () => {
    const { useTimeOnPageTracker } = await import(
      "../lib/time-on-page-tracker"
    );
    renderHook(() => useTimeOnPageTracker());

    // Advance 20s with tab visible
    vi.advanceTimersByTime(20_000);
    expect(plausibleSpy).not.toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 30 },
    });

    // Hide tab — timer should pause
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // Advance 20s while hidden — should NOT reach 30s threshold
    vi.advanceTimersByTime(20_000);
    expect(plausibleSpy).not.toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 30 },
    });

    // Show tab again — timer resumes from 20s
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // Advance remaining 10s to hit 30s threshold
    vi.advanceTimersByTime(10_000);
    expect(plausibleSpy).toHaveBeenCalledWith("Time on Page", {
      props: { seconds: 30 },
    });
  });

  it("cleans up on unmount", async () => {
    const { useTimeOnPageTracker } = await import(
      "../lib/time-on-page-tracker"
    );
    const { unmount } = renderHook(() => useTimeOnPageTracker());

    unmount();

    // After unmount, advancing timers should not fire events
    plausibleSpy.mockClear();
    vi.advanceTimersByTime(300_000);
    expect(plausibleSpy).not.toHaveBeenCalled();
  });
});

// ─── UTM Capture (with ad click IDs + cookies) ─────────────────────────────────

describe("UTM capture", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (name) {
        document.cookie = `${name}=; max-age=0; path=/`;
      }
    });
  });

  function setLocation(search: string, pathname = "/") {
    Object.defineProperty(window, "location", {
      value: { search, pathname },
      configurable: true,
      writable: true,
    });
  }

  it("captures UTM params from URL and stores in sessionStorage", async () => {
    setLocation("?utm_source=google&utm_medium=cpc&utm_campaign=spring2026");
    Object.defineProperty(document, "referrer", {
      value: "https://google.com",
      configurable: true,
    });

    const { captureUtmParams, getUtmParams } = await import("../lib/utm");
    captureUtmParams();

    const params = getUtmParams();
    expect(params.utm_source).toBe("google");
    expect(params.utm_medium).toBe("cpc");
    expect(params.utm_campaign).toBe("spring2026");
  });

  it("captures gclid from URL", async () => {
    setLocation("?gclid=abc123");
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    const { captureUtmParams, getUtmParams } = await import("../lib/utm");
    captureUtmParams();

    const params = getUtmParams();
    expect(params.gclid).toBe("abc123");
  });

  it("captures fbclid from URL", async () => {
    setLocation("?fbclid=fb456");
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    const { captureUtmParams, getUtmParams } = await import("../lib/utm");
    captureUtmParams();

    const params = getUtmParams();
    expect(params.fbclid).toBe("fb456");
  });

  it("captures msclkid from URL", async () => {
    setLocation("?msclkid=ms789");
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    const { captureUtmParams, getUtmParams } = await import("../lib/utm");
    captureUtmParams();

    const params = getUtmParams();
    expect(params.msclkid).toBe("ms789");
  });

  it("stores params in a first-party cookie", async () => {
    setLocation("?utm_source=facebook&fbclid=fb999");
    Object.defineProperty(document, "referrer", {
      value: "https://facebook.com",
      configurable: true,
    });

    const { captureUtmParams } = await import("../lib/utm");
    captureUtmParams();

    expect(document.cookie).toContain("aivo_utm=");
    // Decode and verify the cookie contains our params
    const match = document.cookie.match(/aivo_utm=([^;]*)/);
    expect(match).toBeTruthy();
    const parsed = JSON.parse(decodeURIComponent(match![1]));
    expect(parsed.utm_source).toBe("facebook");
    expect(parsed.fbclid).toBe("fb999");
  });

  it("captures referrer from document.referrer", async () => {
    setLocation("?utm_source=email");
    Object.defineProperty(document, "referrer", {
      value: "https://mail.google.com",
      configurable: true,
    });

    const { captureUtmParams, getUtmParams } = await import("../lib/utm");
    captureUtmParams();

    const params = getUtmParams();
    expect(params.referrer).toBe("https://mail.google.com");
  });

  it("falls back to cookie when sessionStorage is empty", async () => {
    setLocation("?utm_source=bing&msclkid=ms123");
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    const { captureUtmParams, getUtmParams } = await import("../lib/utm");
    captureUtmParams();

    // Clear sessionStorage but leave cookie intact
    sessionStorage.clear();

    const params = getUtmParams();
    expect(params.utm_source).toBe("bing");
    expect(params.msclkid).toBe("ms123");
  });

  it("attaches UTM params to payloads", async () => {
    setLocation("?utm_source=linkedin&gclid=g123");
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    const { captureUtmParams, attachUtmToPayload } = await import(
      "../lib/utm"
    );
    captureUtmParams();

    const enriched = attachUtmToPayload({ contactEmail: "test@test.com" });
    expect(enriched.contactEmail).toBe("test@test.com");
    expect(enriched.utmParams.utm_source).toBe("linkedin");
    expect(enriched.utmParams.gclid).toBe("g123");
  });

  it("returns empty params when nothing is captured", async () => {
    setLocation("");
    const { getUtmParams } = await import("../lib/utm");
    const params = getUtmParams();
    expect(params).toEqual({});
  });
});
