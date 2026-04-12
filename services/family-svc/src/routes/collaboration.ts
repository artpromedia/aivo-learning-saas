import { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import {
  learnerTeachers,
  learnerCaregivers,
  learnerTherapists,
  learners,
  users,
  brainInsights,
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

export async function registerCollaborationRoutes(app: FastifyInstance) {
  const db = (app as any).db;

  app.get("/api/family/collaboration/:learnerId/members", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent && claims.role !== "PLATFORM_ADMIN") {
      return reply.code(403).send({ error: "Access denied" });
    }

    const teachers = await db.select().from(learnerTeachers).where(eq(learnerTeachers.learnerId, learnerId));
    const caregivers = await db.select().from(learnerCaregivers).where(eq(learnerCaregivers.learnerId, learnerId));
    const therapists = await db.select().from(learnerTherapists).where(eq(learnerTherapists.learnerId, learnerId));

    return {
      teachers: teachers.map((t: any) => ({ ...t, memberType: "teacher" })),
      caregivers: caregivers.map((c: any) => ({ ...c, memberType: "caregiver" })),
      therapists: therapists.map((t: any) => ({ ...t, memberType: "therapist" })),
    };
  });

  app.post("/api/family/collaboration/:learnerId/invite/teacher", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent) return reply.code(403).send({ error: "Only parents can invite team members" });

    const { email, name } = request.body as any;
    if (!email) return reply.code(400).send({ error: "Email is required" });

    const existing = await db.select().from(learnerTeachers).where(
      and(eq(learnerTeachers.learnerId, learnerId), eq(learnerTeachers.teacherEmail, email))
    );
    if (existing.length > 0) return reply.code(409).send({ error: "Teacher already invited" });

    const existingCount = await db.select().from(learnerTeachers).where(eq(learnerTeachers.learnerId, learnerId));
    if (existingCount.length >= 1) {
      return reply.code(400).send({ error: "B2C plan allows 1 teacher slot. Upgrade for more." });
    }

    const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId));
    const tenantId = learnerRows[0]?.tenantId || "00000000-0000-0000-0000-000000000001";

    const [record] = await db.insert(learnerTeachers).values({
      tenantId,
      learnerId,
      teacherEmail: email,
      invitedBy: claims.userId,
      status: "PENDING",
    }).returning();

    return reply.code(201).send(record);
  });

  app.post("/api/family/collaboration/:learnerId/invite/caregiver", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent) return reply.code(403).send({ error: "Only parents can invite team members" });

    const { email, relationship } = request.body as any;
    if (!email) return reply.code(400).send({ error: "Email is required" });

    const existing = await db.select().from(learnerCaregivers).where(
      and(eq(learnerCaregivers.learnerId, learnerId), eq(learnerCaregivers.caregiverEmail, email))
    );
    if (existing.length > 0) return reply.code(409).send({ error: "Caregiver already invited" });

    const existingCount = await db.select().from(learnerCaregivers).where(eq(learnerCaregivers.learnerId, learnerId));
    if (existingCount.length >= 2) {
      return reply.code(400).send({ error: "Maximum 2 caregivers allowed" });
    }

    const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId));
    const tenantId = learnerRows[0]?.tenantId || "00000000-0000-0000-0000-000000000001";

    const [record] = await db.insert(learnerCaregivers).values({
      tenantId,
      learnerId,
      caregiverEmail: email,
      invitedBy: claims.userId,
      relationship: relationship || null,
      status: "PENDING",
    }).returning();

    return reply.code(201).send(record);
  });

  app.post("/api/family/collaboration/:learnerId/invite/therapist", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent) return reply.code(403).send({ error: "Only parents can invite team members" });

    const { email, specialty, credentials } = request.body as any;
    if (!email) return reply.code(400).send({ error: "Email is required" });

    const existing = await db.select().from(learnerTherapists).where(
      and(eq(learnerTherapists.learnerId, learnerId), eq(learnerTherapists.therapistEmail, email))
    );
    if (existing.length > 0) return reply.code(409).send({ error: "Therapist already invited" });

    const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId));
    const tenantId = learnerRows[0]?.tenantId || "00000000-0000-0000-0000-000000000001";

    const [record] = await db.insert(learnerTherapists).values({
      tenantId,
      learnerId,
      therapistEmail: email,
      invitedBy: claims.userId,
      specialty: specialty || null,
      credentials: credentials || null,
      status: "PENDING",
    }).returning();

    return reply.code(201).send(record);
  });

  app.delete("/api/family/collaboration/:learnerId/member/:memberId", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId, memberId } = request.params as any;
    const isParent = await verifyParentOwnership(db, claims.userId, learnerId);
    if (!isParent) return reply.code(403).send({ error: "Only parents can remove team members" });

    const { memberType } = request.query as any;

    if (memberType === "teacher") {
      await db.delete(learnerTeachers).where(and(eq(learnerTeachers.id, memberId), eq(learnerTeachers.learnerId, learnerId)));
    } else if (memberType === "caregiver") {
      await db.delete(learnerCaregivers).where(and(eq(learnerCaregivers.id, memberId), eq(learnerCaregivers.learnerId, learnerId)));
    } else if (memberType === "therapist") {
      await db.delete(learnerTherapists).where(and(eq(learnerTherapists.id, memberId), eq(learnerTherapists.learnerId, learnerId)));
    } else {
      return reply.code(400).send({ error: "memberType query param required (teacher|caregiver|therapist)" });
    }

    return { status: "removed" };
  });

  app.post("/api/family/collaboration/:learnerId/insight", async (request, reply) => {
    const token = extractToken(request);
    if (!token) return reply.code(401).send({ error: "Authentication required" });

    let claims: any;
    try { claims = await verifyJWT(token); } catch { return reply.code(401).send({ error: "Invalid token" }); }

    const { learnerId } = request.params as any;
    const { insightText, domain, source } = request.body as any;
    if (!insightText) return reply.code(400).send({ error: "insightText is required" });

    const [record] = await db.insert(brainInsights).values({
      learnerId,
      source: source || claims.role?.toLowerCase() || "collaborator",
      sourceUserId: claims.userId,
      insightText,
      domain: domain || null,
    }).returning();

    return reply.code(201).send(record);
  });
}
