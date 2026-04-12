import { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import {
  brainRecommendations,
  learners,
} from "@aivo/db";
import { verifyJWT } from "@aivo/security";

function extractToken(request: any): string | null {
  const auth = request.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return request.cookies?.access_token || null;
}

async function verifyParentOwnership(db: any, userId: string, learnerId: string): Promise<boolean> {
  const result = await db.select().from(learners).where(
    and(eq(learners.id, learnerId), eq(learners.parentId, userId))
  );
  return result.length > 0;
}

export async function registerRecommendationRoutes(app: FastifyInstance) {
  const db = (app as any).db;

  app.get("/api/family/recommendations/:learnerId", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const { status } = request.query as any;

    let query = db.select().from(brainRecommendations)
      .where(eq(brainRecommendations.learnerId, learnerId))
      .orderBy(desc(brainRecommendations.createdAt));

    const allRecs = await query;

    if (status) {
      return allRecs.filter((r: any) => r.status === status);
    }

    return allRecs;
  });

  app.post("/api/family/recommendations/:learnerId/:recId/respond", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId, recId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent) return reply.code(403).send({ error: "Only parents can respond to recommendations" });

    const { action, notes } = request.body as any;
    if (!["APPROVED", "DECLINED", "ADJUSTED"].includes(action)) {
      return reply.code(400).send({ error: "action must be APPROVED, DECLINED, or ADJUSTED" });
    }

    const existing = await db.select().from(brainRecommendations).where(
      and(eq(brainRecommendations.id, recId), eq(brainRecommendations.learnerId, learnerId))
    );
    if (existing.length === 0) return reply.code(404).send({ error: "Recommendation not found" });

    await db.update(brainRecommendations).set({
      status: action,
      parentNotes: notes || null,
      resolvedAt: new Date(),
    }).where(eq(brainRecommendations.id, recId));

    return { status: "updated", action };
  });

  app.get("/api/family/recommendations/:learnerId/history", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const resolved = await db.select().from(brainRecommendations).where(
      and(
        eq(brainRecommendations.learnerId, learnerId),
      )
    ).orderBy(desc(brainRecommendations.createdAt));

    const pending = resolved.filter((r: any) => r.status === "PENDING");
    const acted = resolved.filter((r: any) => r.status !== "PENDING");

    return { pending, acted, total: resolved.length };
  });

  app.get("/api/family/recommendations/:learnerId/conflicts", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const allRecs = await db.select().from(brainRecommendations).where(
      and(eq(brainRecommendations.learnerId, learnerId), eq(brainRecommendations.status, "PENDING"))
    );

    const domainGroups: Record<string, any[]> = {};
    for (const rec of allRecs) {
      const domain = (rec as any).payload?.domain || (rec as any).type || "general";
      if (!domainGroups[domain]) domainGroups[domain] = [];
      domainGroups[domain].push(rec);
    }

    const conflicts = Object.entries(domainGroups)
      .filter(([, recs]) => recs.length > 1)
      .map(([domain, recs]) => ({
        domain,
        conflictingRecommendations: recs,
        description: `Multiple pending recommendations for ${domain} — review to resolve`,
      }));

    return { conflicts, count: conflicts.length };
  });
}
