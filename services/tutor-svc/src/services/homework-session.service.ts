import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { homeworkSessions, homeworkAssignments, learners } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { BrainRelayService } from "./brain-relay.service.js";
import { getHomeworkMode } from "../data/homework-modes.js";
import { getSkuForSubject } from "../data/tutor-catalog.js";

export class HomeworkSessionService {
  private brainRelay: BrainRelayService;

  constructor(private readonly app: FastifyInstance) {
    this.brainRelay = new BrainRelayService(app);
  }

  async startSession(assignmentId: string, learnerId: string) {
    // Load assignment
    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      throw Object.assign(new Error("Assignment not found"), {
        statusCode: 404,
      });
    }

    // Load brain context
    const brainContext = await this.brainRelay.fetchContext(learnerId);

    // Determine homework mode from functioning level
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    const functioningLevel = learner?.functioningLevel ?? "STANDARD";
    const homeworkMode = getHomeworkMode(functioningLevel);
    const tutorSku = getSkuForSubject(assignment.subject) ?? assignment.subject;

    // Create homework session record
    const [session] = await this.app.db
      .insert(homeworkSessions)
      .values({
        homeworkAssignmentId: assignmentId,
        learnerId,
        tutorSku: tutorSku as typeof homeworkSessions.$inferInsert.tutorSku,
        messages: [],
        startedAt: new Date(),
      })
      .returning();

    // Update assignment status to IN_PROGRESS
    await this.app.db
      .update(homeworkAssignments)
      .set({ status: "IN_PROGRESS" })
      .where(eq(homeworkAssignments.id, assignmentId));

    await publishEvent(this.app.nats, "homework.session.started", {
      learnerId,
      assignmentId,
      sessionId: session.id,
    });

    return session;
  }

  async sendMessage(sessionId: string, userInput: string) {
    // Load session
    const session = await this.getSession(sessionId);
    if (!session) {
      throw Object.assign(new Error("Homework session not found"), {
        statusCode: 404,
      });
    }

    // Load assignment for context
    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, session.homeworkAssignmentId))
      .limit(1);

    if (!assignment) {
      throw Object.assign(new Error("Assignment not found"), {
        statusCode: 404,
      });
    }

    // Build conversation history
    const conversationHistory = (session.messages ?? []) as Array<{
      role: string;
      content: string;
    }>;

    const userMessage = {
      role: "user" as const,
      content: userInput,
      timestamp: new Date().toISOString(),
    };

    // Call AI tutor with assignment context
    const aiResponse = (await this.app.aiClient.tutorRespond({
      learnerId: session.learnerId,
      sessionId,
      subject: assignment.subject,
      messages: [
        ...conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: userMessage.role, content: userMessage.content },
      ],
      brainContext: {
        adaptedProblems: assignment.adaptedProblems,
        homeworkMode: assignment.homeworkMode,
      },
    })) as { content: string };

    const assistantMessage = {
      role: "assistant" as const,
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
    };

    // Append both messages
    const updatedMessages = [
      ...conversationHistory,
      userMessage,
      assistantMessage,
    ];

    // Track hints (assistant messages that contain hint-like content)
    const hintsUsed = updatedMessages.filter(
      (m) => m.role === "assistant",
    ).length;

    await this.app.db
      .update(homeworkSessions)
      .set({
        messages: updatedMessages,
        hintsUsed,
      })
      .where(eq(homeworkSessions.id, sessionId));

    return {
      content: aiResponse.content,
    };
  }

  async endSession(sessionId: string) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw Object.assign(new Error("Homework session not found"), {
        statusCode: 404,
      });
    }

    // Load assignment to get total problems
    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, session.homeworkAssignmentId))
      .limit(1);

    const now = new Date();
    const startedAt = new Date(session.startedAt);
    const durationSeconds = Math.floor(
      (now.getTime() - startedAt.getTime()) / 1000,
    );

    // Calculate completion quality
    const totalProblems = Array.isArray(assignment?.adaptedProblems)
      ? (assignment.adaptedProblems as unknown[]).length
      : 0;
    const problemsCompleted = session.problemsCompleted ?? 0;
    const problemsAttempted = session.problemsAttempted ?? 0;
    const hintsUsed = session.hintsUsed ?? 0;

    // Completion quality: ratio of completed to total, adjusted down for hint usage
    const baseQuality =
      totalProblems > 0 ? problemsCompleted / totalProblems : 0;
    const hintPenalty = Math.min(hintsUsed * 0.05, 0.3); // max 30% penalty
    const completionQuality = Math.max(0, Math.min(1, baseQuality - hintPenalty));

    const [updated] = await this.app.db
      .update(homeworkSessions)
      .set({
        endedAt: now,
        durationSeconds,
        completionQuality: String(completionQuality),
        problemsAttempted,
        problemsCompleted,
      })
      .where(eq(homeworkSessions.id, sessionId))
      .returning();

    // Update assignment status to COMPLETED
    if (assignment) {
      await this.app.db
        .update(homeworkAssignments)
        .set({ status: "COMPLETED" })
        .where(eq(homeworkAssignments.id, assignment.id));
    }

    await publishEvent(this.app.nats, "homework.session.completed", {
      learnerId: session.learnerId,
      assignmentId: session.homeworkAssignmentId,
      sessionId: session.id,
      subject: assignment?.subject ?? "unknown",
      completionQuality,
      problemsCompleted,
      hintsUsed,
      durationSeconds,
    });

    return updated;
  }

  private async getSession(sessionId: string) {
    const [session] = await this.app.db
      .select()
      .from(homeworkSessions)
      .where(eq(homeworkSessions.id, sessionId))
      .limit(1);

    return session ?? null;
  }
}
