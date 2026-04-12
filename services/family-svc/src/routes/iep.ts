import { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import {
  iepGoals,
  iepProfiles,
  iepDocuments,
  learners,
  brainStates,
  gradebookEntries,
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

export async function registerIepRoutes(app: FastifyInstance) {
  const db = (app as any).db;

  app.get("/api/family/iep/:learnerId/goals", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const goals = await db.select().from(iepGoals)
      .where(eq(iepGoals.learnerId, learnerId))
      .orderBy(desc(iepGoals.createdAt));

    return goals;
  });

  app.get("/api/family/iep/:learnerId/goals/:goalId", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId, goalId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const goal = await db.select().from(iepGoals).where(
      and(eq(iepGoals.id, goalId), eq(iepGoals.learnerId, learnerId))
    );
    if (goal.length === 0) return reply.code(404).send({ error: "Goal not found" });

    return goal[0];
  });

  app.get("/api/family/iep/:learnerId/profile", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const profiles = await db.select().from(iepProfiles)
      .where(eq(iepProfiles.learnerId, learnerId))
      .orderBy(desc(iepProfiles.createdAt));

    return profiles[0] || null;
  });

  app.get("/api/family/iep/:learnerId/documents", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const docs = await db.select().from(iepDocuments)
      .where(eq(iepDocuments.learnerId, learnerId))
      .orderBy(desc(iepDocuments.uploadedAt));

    return docs;
  });

  app.get("/api/family/iep/:learnerId/progress", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const goals = await db.select().from(iepGoals)
      .where(eq(iepGoals.learnerId, learnerId));

    const brainState = await db.select().from(brainStates)
      .where(eq(brainStates.learnerId, learnerId));

    const gradebook = await db.select().from(gradebookEntries)
      .where(eq(gradebookEntries.learnerId, learnerId));

    const masteryMap: Record<string, number> = {};
    for (const entry of gradebook) {
      masteryMap[entry.subject] = Math.max(masteryMap[entry.subject] || 0, entry.masteryScore || 0);
    }

    const goalProgress = goals.map((goal: any) => {
      const domain = goal.domain || "";
      const currentMastery = masteryMap[domain] || 0;
      const baselineVal = parseFloat(goal.baseline || "0") || 0;
      const targetVal = parseFloat(goal.targetCriteria || "100") || 100;
      const range = targetVal - baselineVal;
      const progressPct = range > 0 ? Math.min(100, Math.max(0, ((currentMastery - baselineVal) / range) * 100)) : 0;

      let trend: "improving" | "stable" | "declining" = "stable";
      if (goal.currentProgress > 0) {
        if (currentMastery > goal.currentProgress) trend = "improving";
        else if (currentMastery < goal.currentProgress) trend = "declining";
      }

      return {
        goalId: goal.id,
        goalText: goal.goalText,
        domain: goal.domain,
        baseline: goal.baseline,
        targetCriteria: goal.targetCriteria,
        currentValue: currentMastery,
        currentProgress: goal.currentProgress,
        progressPercent: Math.round(progressPct),
        trend,
        status: goal.status,
      };
    });

    return {
      learnerId,
      goals: goalProgress,
      totalGoals: goals.length,
      activeGoals: goals.filter((g: any) => g.status === "active").length,
      brainStateVersion: brainState[0]?.version || 0,
    };
  });

  app.get("/api/family/iep/:learnerId/report", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId));
    if (learnerRows.length === 0) return reply.code(404).send({ error: "Learner not found" });
    const learner = learnerRows[0];

    const goals = await db.select().from(iepGoals).where(eq(iepGoals.learnerId, learnerId));
    const profile = await db.select().from(iepProfiles).where(eq(iepProfiles.learnerId, learnerId));
    const brainState = await db.select().from(brainStates).where(eq(brainStates.learnerId, learnerId));
    const gradebook = await db.select().from(gradebookEntries).where(eq(gradebookEntries.learnerId, learnerId));

    const masteryMap: Record<string, number> = {};
    for (const entry of gradebook) {
      masteryMap[entry.subject] = Math.max(masteryMap[entry.subject] || 0, entry.masteryScore || 0);
    }

    const goalSections = goals.map((goal: any) => {
      const domain = goal.domain || "";
      const currentMastery = masteryMap[domain] || 0;
      const baselineVal = parseFloat(goal.baseline || "0") || 0;
      const targetVal = parseFloat(goal.targetCriteria || "100") || 100;
      const range = targetVal - baselineVal;
      const progressPct = range > 0 ? Math.min(100, Math.max(0, ((currentMastery - baselineVal) / range) * 100)) : 0;

      return {
        goalText: goal.goalText,
        domain: goal.domain,
        baseline: goal.baseline,
        target: goal.targetCriteria,
        currentMastery,
        progressPercent: Math.round(progressPct),
        status: goal.status,
        evidence: `Current mastery in ${domain}: ${currentMastery}%. Baseline was ${goal.baseline || "N/A"}, target is ${goal.targetCriteria || "N/A"}.`,
      };
    });

    const report = {
      title: `IEP Progress Report — ${learner.name}`,
      generatedAt: new Date().toISOString(),
      learner: {
        name: learner.name,
        gradeLevel: learner.gradeLevel,
        functioningLevel: learner.functioningLevel,
        dateOfBirth: learner.dateOfBirth,
      },
      iepProfile: profile[0] || null,
      brainSummary: {
        version: brainState[0]?.version || 0,
        activeAccommodations: brainState[0]?.activeAccommodations || [],
        functioningLevelProfile: brainState[0]?.functioningLevelProfile || {},
      },
      goals: goalSections,
      summary: {
        totalGoals: goals.length,
        activeGoals: goals.filter((g: any) => g.status === "active").length,
        metGoals: goals.filter((g: any) => g.status === "met").length,
        averageProgress: goalSections.length > 0
          ? Math.round(goalSections.reduce((sum: number, g: any) => sum + g.progressPercent, 0) / goalSections.length)
          : 0,
      },
    };

    return report;
  });
}
