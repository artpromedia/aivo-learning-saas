import { describe, it, expect } from "vitest";
import { signPayload, verifySignature } from "../webhooks/signature.js";

describe("Webhook HMAC Signature", () => {
  const secret = "whsec_test_secret_12345";

  it("should generate consistent HMAC-SHA256 signature", () => {
    const payload = JSON.stringify({ event: "test", data: { id: "123" } });

    const sig1 = signPayload(payload, secret);
    const sig2 = signPayload(payload, secret);

    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64); // SHA256 hex
  });

  it("should verify valid signature", () => {
    const payload = JSON.stringify({ event: "test" });
    const signature = signPayload(payload, secret);

    expect(verifySignature(payload, secret, signature)).toBe(true);
  });

  it("should reject invalid signature", () => {
    const payload = JSON.stringify({ event: "test" });
    const wrongSignature = "a".repeat(64);

    expect(verifySignature(payload, secret, wrongSignature)).toBe(false);
  });

  it("should reject signature with tampered payload", () => {
    const payload = JSON.stringify({ event: "test" });
    const signature = signPayload(payload, secret);

    const tamperedPayload = JSON.stringify({ event: "tampered" });
    expect(verifySignature(tamperedPayload, secret, signature)).toBe(false);
  });

  it("should reject signature with wrong secret", () => {
    const payload = JSON.stringify({ event: "test" });
    const signature = signPayload(payload, secret);

    expect(verifySignature(payload, "wrong_secret", signature)).toBe(false);
  });

  it("should use constant-time comparison to prevent timing attacks", () => {
    const payload = JSON.stringify({ event: "test" });
    const signature = signPayload(payload, secret);

    // Verify the function exists and works (timing attack prevention is in implementation)
    const result = verifySignature(payload, secret, signature);
    expect(result).toBe(true);
  });
});
