"use client";

/**
 * Scroll-depth engagement tracker.
 *
 * Fires `events.scrollDepth(percent)` at 25%, 50%, 75%, and 100%
 * thresholds. Each threshold fires exactly once per page load.
 * Uses `requestAnimationFrame` to avoid layout-thrashing on the
 * scroll handler.
 */

import { useEffect, useRef } from "react";
import { events } from "@/lib/analytics";

const THRESHOLDS = [25, 50, 75, 100] as const;

/**
 * React hook that tracks how far the user scrolls down the page.
 *
 * Safe for SSR — no-ops when `window` is unavailable.
 * Cleans up the scroll listener and pending rAF on unmount.
 *
 * @example
 * ```tsx
 * function Page() {
 *   useScrollDepthTracker();
 *   return <main>…</main>;
 * }
 * ```
 */
export function useScrollDepthTracker(): void {
  const firedRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fired = firedRef.current;

    function checkDepth(): void {
      rafRef.current = null;

      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const percent = (scrollTop / docHeight) * 100;

      for (const threshold of THRESHOLDS) {
        if (percent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          events.scrollDepth(threshold);
        }
      }
    }

    function onScroll(): void {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(checkDepth);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    // Check initial position (page may already be scrolled on mount)
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
}
