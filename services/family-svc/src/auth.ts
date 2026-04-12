import { FastifyRequest, FastifyReply } from "fastify";
import { eq, and } from "drizzle-orm";
import { learners } from "@aivo/db";
import { verifyJWT } from "@aivo/security";

export interface JWTClaims {
  userId: string;
  role: string;
}

export function extractToken(request: FastifyRequest): string | null {
  const auth = request.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<JWTClaims | null> {
  const token = extractToken(request);
  if (!token) {
    reply.code(401).send({ error: "Authentication required" });
    return null;
  }
  try {
    return await verifyJWT(token) as JWTClaims;
  } catch (_err) {
    reply.code(401).send({ error: "Invalid token" });
    return null;
  }
}

export async function verifyParentOwnership(
  db: ReturnType<typeof import("@aivo/db").createDb>,
  userId: string,
  learnerId: string
): Promise<boolean> {
  const result = await db.select().from(learners).where(
    and(eq(learners.id, learnerId), eq(learners.parentId, userId))
  );
  return result.length > 0;
}
