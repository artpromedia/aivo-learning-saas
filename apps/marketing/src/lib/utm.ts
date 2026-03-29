/**
 * UTM attribution capture and persistence.
 *
 * Stores UTM parameters in sessionStorage so they survive page
 * navigation within a session but respect privacy by not using cookies.
 */

const UTM_STORAGE_KEY = "aivo_utm";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landingPage?: string;
}

/**
 * Capture UTM parameters from the current URL query string.
 * Called once on first page load via UtmCapture component.
 */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }

  if (Object.keys(utm).length > 0) {
    utm.referrer = document.referrer;
    utm.landingPage = window.location.pathname;
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }
}

/**
 * Retrieve stored UTM parameters from sessionStorage.
 */
export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}

/**
 * Attach UTM parameters to any form submission payload.
 */
export function attachUtmToPayload<T extends object>(
  payload: T,
): T & { utmParams: UtmParams } {
  return { ...payload, utmParams: getUtmParams() };
}
