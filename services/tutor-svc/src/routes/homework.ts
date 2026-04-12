import { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { homeworkAssignments, homeworkSessions, tutorSubscriptions } from "@aivo/db";

const AI_SVC_URL = process.env.AI_SVC_URL || "http://localhost:3004";
const BRAIN_SVC_URL = process.env.BRAIN_SVC_URL || "http://localhost:3002";

const SUBJECT_TO_SKU: Record<string, string> = {
  MATH: "ADDON_TUTOR_MATH",
  ELA: "ADDON_TUTOR_ELA",
  SCIENCE: "ADDON_TUTOR_SCIENCE",
  HISTORY: "ADDON_TUTOR_HISTORY",
  CODING: "ADDON_TUTOR_CODING",
};

const SKU_TO_SUBJECT: Record<string, string> = {};
for (const [subj, sku] of Object.entries(SUBJECT_TO_SKU)) {
  SKU_TO_SUBJECT[sku] = subj.toLowerCase();
}

async function fetchBrainContext(learnerId: string): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${BRAIN_SVC_URL}/api/brain/${learnerId}`);
    if (res.ok) {
      const data = await res.json();
      return (data as any).state || {};
    }
  } catch {}
  return {};
}

async function checkSubscription(db: any, userId: string, sku: string): Promise<boolean> {
  const subs = await db
    .select()
    .from(tutorSubscriptions)
    .where(
      and(
        eq(tutorSubscriptions.userId, userId),
        eq(tutorSubscriptions.tutorSku, sku),
        eq(tutorSubscriptions.status, "active"),
      ),
    );
  return subs.length > 0;
}

function getFunctioningLevel(brainContext: Record<string, unknown>): string {
  return (brainContext as any)?.functioning_level_profile?.level || "STANDARD";
}

export function registerHomeworkRoutes(app: FastifyInstance, db: any) {
  app.post("/api/tutors/homework/upload", async (request, reply) => {
    const { learnerId, userId, imageBase64, textInput, mimeType } = request.body as any;
    if (!learnerId) {
      return reply.code(400).send({ error: "learnerId is required" });
    }

    try {
      const ocrRes = await fetch(`${AI_SVC_URL}/api/ai/homework/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64 || null,
          text_input: textInput || null,
          mime_type: mimeType || "image/jpeg",
        }),
      });

      if (!ocrRes.ok) {
        const err = await ocrRes.text();
        return reply.code(502).send({ error: "OCR processing failed", detail: err });
      }

      const ocrData: any = await ocrRes.json();
      const detectedSubject = ocrData.detected_subject?.subject || "OTHER";
      const requiredSku = SUBJECT_TO_SKU[detectedSubject];

      if (requiredSku && userId) {
        const hasAccess = await checkSubscription(db, userId, requiredSku);
        if (!hasAccess) {
          return reply.code(403).send({
            error: "Subscription required",
            locked: true,
            requiredSku,
            detectedSubject,
            message: `You need a ${detectedSubject.toLowerCase()} tutor subscription to get help with this homework.`,
          });
        }
      }

      const brainContext = await fetchBrainContext(learnerId);
      const functioningLevel = getFunctioningLevel(brainContext);

      let adaptedProblems: any[] = [];
      if (ocrData.problems && ocrData.problems.length > 0) {
        try {
          const adaptRes = await fetch(`${AI_SVC_URL}/api/ai/homework/adapt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              extracted_problems: ocrData.problems,
              brain_context: brainContext,
              subject: detectedSubject.toLowerCase(),
            }),
          });

          if (adaptRes.ok) {
            const adaptData: any = await adaptRes.json();
            adaptedProblems = adaptData.adapted_problems || [];
          }
        } catch (err) {
          console.error("Adaptation failed, using raw problems:", err);
        }
      }

      const rawProblems = ocrData.problems || [];
      const finalStatus = rawProblems.length > 0 ? "READY" : "FAILED";

      const [assignment] = await db
        .insert(homeworkAssignments)
        .values({
          learnerId,
          subject: detectedSubject.toLowerCase(),
          originalFileType: mimeType || "text/plain",
          extractedText: ocrData.raw_text || textInput || "",
          extractedProblems: rawProblems,
          adaptedProblems: adaptedProblems.length > 0 ? adaptedProblems : rawProblems,
          homeworkMode: functioningLevel,
          status: finalStatus,
          detectedSubject,
          subjectConfidence: String(ocrData.detected_subject?.confidence || 0),
        })
        .returning();

      return {
        assignment: {
          id: assignment.id,
          subject: assignment.subject,
          status: assignment.status,
          homeworkMode: assignment.homeworkMode,
          detectedSubject,
          problemCount: (ocrData.problems || []).length,
          adaptedCount: adaptedProblems.length,
          createdAt: assignment.createdAt,
        },
      };
    } catch (err: any) {
      return reply.code(500).send({ error: "Upload failed", detail: err.message });
    }
  });

  app.get("/api/tutors/homework/learner/:learnerId", async (request) => {
    const { learnerId } = request.params as any;
    const assignments = await db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.learnerId, learnerId))
      .orderBy(desc(homeworkAssignments.createdAt))
      .limit(20);

    return {
      assignments: assignments.map((a: any) => ({
        id: a.id,
        subject: a.subject,
        status: a.status,
        homeworkMode: a.homeworkMode,
        detectedSubject: a.detectedSubject,
        problemCount: (a.extractedProblems as any[])?.length || 0,
        adaptedCount: (a.adaptedProblems as any[])?.length || 0,
        createdAt: a.createdAt,
      })),
    };
  });

  app.get("/api/tutors/homework/:assignmentId", async (request, reply) => {
    const { assignmentId } = request.params as any;
    const [assignment] = await db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, assignmentId));

    if (!assignment) {
      return reply.code(404).send({ error: "Assignment not found" });
    }

    return assignment;
  });

  app.post("/api/tutors/homework/session/start", async (request, reply) => {
    const { assignmentId, learnerId } = request.body as any;
    if (!assignmentId || !learnerId) {
      return reply.code(400).send({ error: "assignmentId and learnerId required" });
    }

    const [assignment] = await db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, assignmentId));

    if (!assignment) {
      return reply.code(404).send({ error: "Assignment not found" });
    }

    const tutorSku = SUBJECT_TO_SKU[assignment.detectedSubject || "OTHER"] || "ADDON_TUTOR_MATH";

    const [session] = await db
      .insert(homeworkSessions)
      .values({
        homeworkAssignmentId: assignmentId,
        learnerId,
        tutorSku,
        messages: [],
      })
      .returning();

    await db
      .update(homeworkAssignments)
      .set({ status: "IN_PROGRESS" })
      .where(eq(homeworkAssignments.id, assignmentId));

    return {
      sessionId: session.id,
      assignmentId,
      tutorSku,
      subject: assignment.subject,
      adaptedProblems: assignment.adaptedProblems,
    };
  });

  app.post("/api/tutors/homework/session/:sessionId/message", async (request, reply) => {
    const { sessionId } = request.params as any;
    const { message } = request.body as any;
    if (!message) return reply.code(400).send({ error: "message required" });

    const [session] = await db
      .select()
      .from(homeworkSessions)
      .where(eq(homeworkSessions.id, sessionId));

    if (!session) return reply.code(404).send({ error: "Session not found" });

    const [assignment] = await db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, session.homeworkAssignmentId));

    const existingMessages = (session.messages as any[]) || [];
    existingMessages.push({ role: "user", content: message, timestamp: new Date().toISOString() });

    const brainContext = await fetchBrainContext(session.learnerId);
    const functioningLevel = getFunctioningLevel(brainContext);

    try {
      const res = await fetch(`${AI_SVC_URL}/api/ai/homework/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutor_sku: session.tutorSku || "ADDON_TUTOR_MATH",
          learner_id: session.learnerId,
          functioning_level: functioningLevel,
          brain_context: brainContext,
          homework_context: assignment
            ? {
                subject: assignment.subject,
                adapted_problems: assignment.adaptedProblems,
              }
            : {},
          messages: existingMessages.map((m: any) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`ai-svc returned ${res.status}`);

      const data: any = await res.json();
      existingMessages.push({
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      });

      await db
        .update(homeworkSessions)
        .set({ messages: existingMessages })
        .where(eq(homeworkSessions.id, sessionId));

      return {
        response: data.response,
        model: data.model,
        messageCount: existingMessages.length,
      };
    } catch (err: any) {
      return reply.code(503).send({ error: "Homework chat failed", detail: err.message });
    }
  });

  app.post("/api/tutors/homework/session/:sessionId/complete", async (request, reply) => {
    const { sessionId } = request.params as any;
    const { problemsAttempted, problemsCompleted } = request.body as any;

    const [session] = await db
      .select()
      .from(homeworkSessions)
      .where(eq(homeworkSessions.id, sessionId));

    if (!session) return reply.code(404).send({ error: "Session not found" });

    const messages = (session.messages as any[]) || [];
    const durationSeconds = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    const completionQuality = problemsCompleted && problemsAttempted
      ? String(Math.min(1.0, problemsCompleted / Math.max(problemsAttempted, 1)))
      : String(Math.min(1.0, messages.length / 10));

    await db
      .update(homeworkSessions)
      .set({
        problemsAttempted: problemsAttempted || 0,
        problemsCompleted: problemsCompleted || 0,
        hintsUsed: messages.filter((m: any) => m.role === "assistant").length,
        durationSeconds,
        completionQuality,
        endedAt: new Date(),
      })
      .where(eq(homeworkSessions.id, sessionId));

    await db
      .update(homeworkAssignments)
      .set({ status: "COMPLETED" })
      .where(eq(homeworkAssignments.id, session.homeworkAssignmentId));

    return { status: "completed", sessionId, durationSeconds };
  });
}
