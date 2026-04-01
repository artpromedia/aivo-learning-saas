"use client";

/**
 * Time-on-page engagement tracker.
 *
 * Fires `events.timeOnPage(seconds)` at 30s, 60s, 120s, and 300s
 * of **active** page time. The timer pauses when the tab is hidden
 * (via the `visibilitychange` API) so background tabs don't inflate
 * engagement metrics. Each threshold fires exactly once.
 */

import { useEffect, useRef } from "react";
import { events } from "@/lib/analytics";

const THRESHOLDS_SECONDS = [30, 60, 120, 300] as const;
const TICK_INTERVAL_MS = 1_000;

/**
 * React hook that tracks cumulative active time on the current page.
 *
 * Safe for SSR — no-ops when `window` is unavailable.
 * Pauses automatically when the browser tab loses focus.
 * Cleans up the interval and visibility listener on unmount.
 *
 * @example
 * ```tsx
 * function Page() {
 *   useTimeOnPageTracker();
 *   return <main>…</main>;
 * }
 * ```
 */
export function useTimeOnPageTracker(): void {
  const elapsedRef = useRef(0);
  const firedRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fired = firedRef.current;

    function startTicking(): void {
      if (intervalRef.current !== null) return;

      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;

        for (const threshold of THRESHOLDS_SECONDS) {
          if (elapsedRef.current >= threshold && !fired.has(threshold)) {
            fired.add(threshold);
            events.timeOnPage(threshold);
          }
        }
      }, TICK_INTERVAL_MS);
    }

    function stopTicking(): void {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function onVisibilityChange(): void {
      if (document.visibilityState === "visible") {
        startTicking();
      } else {
        stopTicking();
      }
    }

    // Start immediately if tab is visible
    if (document.visibilityState === "visible") {
      startTicking();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopTicking();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}
