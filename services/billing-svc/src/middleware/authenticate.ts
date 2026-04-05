import "@fastify/cookie";
import type { FastifyRequest, FastifyReply } from "fastify";
import * as jose from "jose";
import { getConfig } from "../config.js";

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: AccessTokenPayload;
  }
}

let cachedKey: jose.KeyLike | null = null;

async function getPublicKey(): Promise<jose.KeyLike> {
  if (cachedKey) return cachedKey;
  const config = getConfig();
  cachedKey = await jose.importSPKI(config.JWT_PUBLIC_KEY, "RS256");
  return cachedKey;
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token =
    request.cookies?.access_token ??
    request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return reply.status(401).send({ error: "Authentication required" });
  }

  try {
    const publicKey = await getPublicKey();
    const { payload } = await jose.jwtVerify(token, publicKey);
    request.user = {
      sub: payload.sub as string,
      tenantId: payload.tenantId as string,
      role: payload.role as string,
      email: payload.email as string,
    };
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}
