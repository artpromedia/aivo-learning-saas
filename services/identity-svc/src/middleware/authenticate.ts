import type { FastifyRequest, FastifyReply } from "fastify";
import type { AccessTokenPayload } from "../plugins/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    user: AccessTokenPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token =
    request.cookies?.access_token ??
    request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return reply.status(401).send({ error: "Authentication required" });
  }

  try {
    request.user = await request.server.auth.verifyAccessToken(token);
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}
