import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import * as jose from "jose";
import { getConfig } from "../config.js";

export interface AuthPlugin {
  signAccessToken(payload: AccessTokenPayload): Promise<string>;
  signRefreshToken(payload: RefreshTokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
}

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
}

declare module "fastify" {
  interface FastifyInstance {
    auth: AuthPlugin;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const privateKey = await jose.importPKCS8(config.JWT_PRIVATE_KEY, "RS256");
  const publicKey = await jose.importSPKI(config.JWT_PUBLIC_KEY, "RS256");

  const authPlugin: AuthPlugin = {
    async signAccessToken(payload: AccessTokenPayload): Promise<string> {
      return new jose.SignJWT({
        tenantId: payload.tenantId,
        role: payload.role,
        email: payload.email,
      })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject(payload.sub)
        .setJti(randomUUID())
        .setIssuedAt()
        .setExpirationTime("15m")
        .setIssuer("identity-svc")
        .setAudience("aivo")
        .sign(privateKey);
    },

    async signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
      return new jose.SignJWT({ sessionId: payload.sessionId })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime("7d")
        .setIssuer("identity-svc")
        .setAudience("aivo")
        .sign(privateKey);
    },

    async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
      const { payload } = await jose.jwtVerify(token, publicKey, {
        issuer: "identity-svc",
        audience: "aivo",
      });
      return {
        sub: payload.sub as string,
        tenantId: payload.tenantId as string,
        role: payload.role as string,
        email: payload.email as string,
      };
    },

    async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
      const { payload } = await jose.jwtVerify(token, publicKey, {
        issuer: "identity-svc",
        audience: "aivo",
      });
      return {
        sub: payload.sub as string,
        sessionId: payload.sessionId as string,
      };
    },
  };

  fastify.decorate("auth", authPlugin);
});
