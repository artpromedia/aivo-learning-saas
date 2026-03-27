import { describe, it, expect, beforeAll } from "vitest";
import * as jose from "jose";

describe("Auth Plugin JWT operations", () => {
  let privateKey: CryptoKey;
  let publicKey: CryptoKey;

  beforeAll(async () => {
    // Generate test RSA key pair
    const { privateKey: pvt, publicKey: pub } = await jose.generateKeyPair("RS256");
    privateKey = pvt;
    publicKey = pub;
  });

  describe("Access Token", () => {
    it("should sign and verify access token with RS256", async () => {
      const payload = {
        sub: "user-123",
        tenantId: "tenant-456",
        role: "PARENT",
        email: "test@example.com",
      };

      const token = await new jose.SignJWT({
        tenantId: payload.tenantId,
        role: payload.role,
        email: payload.email,
      })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime("15m")
        .setIssuer("identity-svc")
        .setAudience("aivo")
        .sign(privateKey);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      const { payload: decoded } = await jose.jwtVerify(token, publicKey, {
        issuer: "identity-svc",
        audience: "aivo",
      });

      expect(decoded.sub).toBe("user-123");
      expect(decoded.tenantId).toBe("tenant-456");
      expect(decoded.role).toBe("PARENT");
      expect(decoded.email).toBe("test@example.com");
    });

    it("should reject token with wrong issuer", async () => {
      const token = await new jose.SignJWT({ role: "PARENT" })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject("user-1")
        .setIssuedAt()
        .setExpirationTime("15m")
        .setIssuer("wrong-issuer")
        .setAudience("aivo")
        .sign(privateKey);

      await expect(
        jose.jwtVerify(token, publicKey, {
          issuer: "identity-svc",
          audience: "aivo",
        }),
      ).rejects.toThrow();
    });

    it("should reject token with wrong audience", async () => {
      const token = await new jose.SignJWT({ role: "PARENT" })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject("user-1")
        .setIssuedAt()
        .setExpirationTime("15m")
        .setIssuer("identity-svc")
        .setAudience("wrong-audience")
        .sign(privateKey);

      await expect(
        jose.jwtVerify(token, publicKey, {
          issuer: "identity-svc",
          audience: "aivo",
        }),
      ).rejects.toThrow();
    });

    it("should reject expired token", async () => {
      const token = await new jose.SignJWT({ role: "PARENT" })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject("user-1")
        .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 1800)
        .setIssuer("identity-svc")
        .setAudience("aivo")
        .sign(privateKey);

      await expect(
        jose.jwtVerify(token, publicKey, {
          issuer: "identity-svc",
          audience: "aivo",
        }),
      ).rejects.toThrow();
    });
  });

  describe("Refresh Token", () => {
    it("should sign and verify refresh token with 7d expiry", async () => {
      const payload = { sub: "user-123", sessionId: "session-456" };

      const token = await new jose.SignJWT({ sessionId: payload.sessionId })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime("7d")
        .setIssuer("identity-svc")
        .setAudience("aivo")
        .sign(privateKey);

      const { payload: decoded } = await jose.jwtVerify(token, publicKey, {
        issuer: "identity-svc",
        audience: "aivo",
      });

      expect(decoded.sub).toBe("user-123");
      expect(decoded.sessionId).toBe("session-456");

      // Verify expiry is ~7 days out
      const exp = decoded.exp ?? 0;
      const now = Math.floor(Date.now() / 1000);
      const sevenDays = 7 * 24 * 60 * 60;
      expect(exp).toBeGreaterThan(0);
      expect(exp - now).toBeGreaterThan(sevenDays - 60);
      expect(exp - now).toBeLessThanOrEqual(sevenDays + 1);
    });
  });

  describe("Key rejection", () => {
    it("should reject token signed with different key", async () => {
      const { privateKey: otherKey } = await jose.generateKeyPair("RS256");

      const token = await new jose.SignJWT({ role: "PARENT" })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject("user-1")
        .setIssuedAt()
        .setExpirationTime("15m")
        .setIssuer("identity-svc")
        .setAudience("aivo")
        .sign(otherKey);

      await expect(
        jose.jwtVerify(token, publicKey, {
          issuer: "identity-svc",
          audience: "aivo",
        }),
      ).rejects.toThrow();
    });
  });
});
