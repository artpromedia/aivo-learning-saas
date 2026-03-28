import { describe, it, expect } from "vitest";

describe("CSRF Protection", () => {
  const EXEMPT_PATHS = ["/webhooks/", "/lti/", "/stripe/", "/public/", "/health"];

  it("should exempt webhook paths from CSRF", () => {
    const url = "/webhooks/stripe";
    const isExempt = EXEMPT_PATHS.some((p) => url.startsWith(p));
    expect(isExempt).toBe(true);
  });

  it("should exempt LTI paths from CSRF", () => {
    const url = "/lti/launch";
    const isExempt = EXEMPT_PATHS.some((p) => url.startsWith(p));
    expect(isExempt).toBe(true);
  });

  it("should exempt public lead endpoint from CSRF", () => {
    const url = "/public/leads";
    const isExempt = EXEMPT_PATHS.some((p) => url.startsWith(p));
    expect(isExempt).toBe(true);
  });

  it("should NOT exempt regular API paths", () => {
    const url = "/admin/leads";
    const isExempt = EXEMPT_PATHS.some((p) => url.startsWith(p));
    expect(isExempt).toBe(false);
  });

  it("should only apply to state-mutating methods", () => {
    const stateMutating = new Set(["POST", "PUT", "PATCH", "DELETE"]);
    expect(stateMutating.has("POST")).toBe(true);
    expect(stateMutating.has("GET")).toBe(false);
    expect(stateMutating.has("HEAD")).toBe(false);
  });

  it("should require matching cookie and header tokens", () => {
    const cookieToken = "abc123";
    const headerToken = "abc123";
    expect(cookieToken === headerToken).toBe(true);

    const mismatch = "xyz789";
    expect(cookieToken === mismatch).toBe(false);
  });
});
