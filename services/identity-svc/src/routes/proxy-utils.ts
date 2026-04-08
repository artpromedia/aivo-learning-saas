/**
 * Shared utilities for proxy route handlers in identity-svc.
 */

/**
 * Extracts the query string from a Fastify request URL.
 *
 * The "http://localhost" base is arbitrary — `URL()` requires an absolute URL
 * to parse relative paths, but only the `search` (query string) portion is used.
 */
export function getQueryString(requestUrl: string): string {
  return new URL(requestUrl, "http://localhost").search;
}

/**
 * Extracts the bearer token from cookies or the Authorization header,
 * preferring the cookie-based token used by browser clients.
 */
export function getToken(request: {
  cookies?: Record<string, string>;
  headers: { authorization?: string };
}): string | undefined {
  return (
    request.cookies?.access_token ??
    request.headers.authorization?.replace("Bearer ", "")
  );
}
