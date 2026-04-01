/**
 * UTM attribution capture and persistence.
 *
 * Stores UTM parameters and ad-network click IDs in both
 * `sessionStorage` (intra-session) and first-party cookies
 * with a 30-day expiry (cross-session attribution).
 */

const UTM_STORAGE_KEY = "aivo_utm";
const UTM_COOKIE_NAME = "aivo_utm";
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const AD_CLICK_KEYS = ["gclid", "fbclid", "msclkid"] as const;

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  referrer?: string;
  landingPage?: string;
}

/**
 * Set a first-party cookie with SameSite=Lax and a 30-day expiry.
 */
function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/**
 * Read a first-party cookie by name. Returns `null` if not found.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Capture UTM parameters, ad click IDs, and referrer from the
 * current URL query string. Called once on first page load via
 * the `UtmCapture` component.
 *
 * Values are persisted in both `sessionStorage` (for the current
 * session) and a first-party cookie with a 30-day expiry (for
 * cross-session attribution windows).
 */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }

  for (const key of AD_CLICK_KEYS) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }

  if (Object.keys(utm).length > 0) {
    utm.referrer = document.referrer;
    utm.landingPage = window.location.pathname;

    const json = JSON.stringify(utm);
    sessionStorage.setItem(UTM_STORAGE_KEY, json);
    setCookie(UTM_COOKIE_NAME, json);
  }
}

/**
 * Retrieve stored UTM parameters. Checks `sessionStorage` first
 * (current session), then falls back to the cookie (returning visitor).
 */
export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  // Prefer sessionStorage (freshest data for this session)
  const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as UtmParams;
    } catch {
      // fall through to cookie
    }
  }

  // Fallback: cross-session cookie
  const cookieRaw = getCookie(UTM_COOKIE_NAME);
  if (cookieRaw) {
    try {
      return JSON.parse(cookieRaw) as UtmParams;
    } catch {
      return {};
    }
  }

  return {};
}

/**
 * Attach UTM parameters to any form submission payload.
 */
export function attachUtmToPayload<T extends object>(
  payload: T,
): T & { utmParams: UtmParams } {
  return { ...payload, utmParams: getUtmParams() };
}
