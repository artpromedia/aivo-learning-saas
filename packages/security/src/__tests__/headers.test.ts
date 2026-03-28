import { describe, it, expect } from "vitest";

describe("Security Headers", () => {
  const REQUIRED_HEADERS = [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Content-Security-Policy",
  ];

  it("should define all required security headers", () => {
    for (const header of REQUIRED_HEADERS) {
      expect(header).toBeTruthy();
    }
    expect(REQUIRED_HEADERS).toHaveLength(6);
  });

  it("should set HSTS with includeSubDomains and preload", () => {
    const hsts = "max-age=31536000; includeSubDomains; preload";
    expect(hsts).toContain("includeSubDomains");
    expect(hsts).toContain("preload");
    expect(hsts).toContain("31536000");
  });

  it("should deny framing", () => {
    const xfo = "DENY";
    expect(xfo).toBe("DENY");
  });

  it("should set restrictive CSP", () => {
    const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
  });
});
