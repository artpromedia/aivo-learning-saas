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

let cachedPublicKey: jose.KeyLike | null = null;

async function getPublicKey(): Promise<jose.KeyLike> {
  if (cachedPublicKey) return cachedPublicKey;
  const config = getConfig();
  cachedPublicKey = await jose.importSPKI(config.JWT_PUBLIC_KEY, "RS256");
  return cachedPublicKey;
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token =
    (request.headers.authorization ?? "").replace("Bearer ", "") || undefined;

  if (!token) {
    return reply.status(401).send({ error: "Authentication required" });
  }

  try {
    const publicKey = await getPublicKey();
    const { payload } = await jose.jwtVerify(token, publicKey, {
      algorithms: ["RS256"],
    });

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

export async function requirePlatformAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await authenticate(request, reply);
  if (reply.sent) return;
  if (request.user.role !== "PLATFORM_ADMIN") {
    return reply.status(403).send({ error: "Platform admin access required" });
  }
}
