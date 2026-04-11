import { FastifyInstance } from "fastify";
import { iepDocuments, iepProfiles, iepGoals, learners, learnerFunctioningLevels } from "@aivo/db";
import { verifyJWT } from "@aivo/security";
import { eq } from "drizzle-orm";

async function authenticate(req: any, reply: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return reply.status(401).send({ error: "Unauthorized" });
  try { req.user = await verifyJWT(auth.slice(7)); } catch { return reply.status(401).send({ error: "Invalid token" }); }
}

export async function registerIepRoutes(app: FastifyInstance) {
  app.post("/api/iep/upload", {
    schema: {
      tags: ["IEP"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["learnerId", "fileName"],
        properties: {
          learnerId: { type: "string" },
          fileName: { type: "string" },
          fileUrl: { type: "string" },
          parsedData: { type: "object" },
        },
      },
    },
    preHandler: authenticate,
  }, async (req) => {
    const db = (app as any).db;
    const body = req.body as any;

    const [doc] = await db.insert(iepDocuments).values({
      learnerId: body.learnerId,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      parsedData: body.parsedData,
      status: body.parsedData ? "parsed" : "uploaded",
    }).returning();

    if (body.parsedData) {
      const parsed = body.parsedData;
      const [profile] = await db.insert(iepProfiles).values({
        learnerId: body.learnerId,
        disabilityCategories: parsed.disabilityCategories || [],
        accommodations: parsed.accommodations || [],
        goals: parsed.goals || [],
        gradeLevel: parsed.gradeLevel,
        communicationSystem: parsed.communicationSystem,
        assistiveTechnology: parsed.assistiveTechnology || [],
        recommendedFunctioningLevel: parsed.recommendedFunctioningLevel,
      }).returning();

      if (parsed.goals?.length) {
        for (const goal of parsed.goals) {
          await db.insert(iepGoals).values({
            learnerId: body.learnerId,
            iepProfileId: profile.id,
            goalText: goal.text || goal,
            domain: goal.domain,
            baseline: goal.baseline,
            targetCriteria: goal.targetCriteria,
          });
        }
      }

      if (parsed.recommendedFunctioningLevel) {
        await db.update(learners)
          .set({ functioningLevel: parsed.recommendedFunctioningLevel })
          .where(eq(learners.id, body.learnerId));

        await db.insert(learnerFunctioningLevels).values({
          learnerId: body.learnerId,
          level: parsed.recommendedFunctioningLevel,
          determinedBy: "iep_parse",
          iepSignals: {
            disabilityCategories: parsed.disabilityCategories,
            communicationSystem: parsed.communicationSystem,
            accommodations: parsed.accommodations,
          },
          confidence: 90,
        });
      }

      return { document: doc, profile };
    }

    return { document: doc };
  });

  app.get("/api/iep/learner/:learnerId", {
    schema: { tags: ["IEP"], security: [{ bearerAuth: [] }] },
    preHandler: authenticate,
  }, async (req) => {
    const db = (app as any).db;
    const { learnerId } = req.params as any;

    const profiles = await db.select().from(iepProfiles)
      .where(eq(iepProfiles.learnerId, learnerId));
    const goals = await db.select().from(iepGoals)
      .where(eq(iepGoals.learnerId, learnerId));
    const documents = await db.select().from(iepDocuments)
      .where(eq(iepDocuments.learnerId, learnerId));

    return { profiles, goals, documents };
  });
}
