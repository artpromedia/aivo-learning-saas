import { eq, and, desc } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { homeworkAssignments, homeworkSessions, learners } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { BrainRelayService } from "./brain-relay.service.js";
import { SubscriptionGateService } from "./subscription-gate.service.js";
import { getStorageBackend } from "./storage-backend.service.js";
import { getHomeworkMode } from "../data/homework-modes.js";
import { getSkuForSubject } from "../data/tutor-catalog.js";

export interface UploadResult {
  assignment: typeof homeworkAssignments.$inferSelect;
  locked?: boolean;
  requiredSku?: string;
}

export interface SessionResult {
  session: typeof homeworkSessions.$inferSelect;
  firstPrompt?: string;
}

export class HomeworkService {
  private brainRelay: BrainRelayService;
  private gate: SubscriptionGateService;

  constructor(private readonly app: FastifyInstance) {
    this.brainRelay = new BrainRelayService(app);
    this.gate = new SubscriptionGateService(app);
  }

  /**
   * Full upload → OCR → subscription gate → adapt → persist pipeline.
   */
  async uploadAndProcess(
    learnerId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subjectHint?: string,
  ): Promise<UploadResult> {
    // Step 1: Store file
    const storage = getStorageBackend();
    const stored = await storage.upload(fileBuffer, fileName, mimeType);

    // Step 2: OCR extraction via ai-svc vision endpoint
    const extraction = (await this.app.aiClient.visionExtract({
      fileBuffer,
      mimeType,
    })) as {
      raw_text?: string;
      detected_subject?: { subject?: string } | null;
      problems?: unknown[];
    };

    // Step 3: Detect subject
    const detectedSubject =
      subjectHint ??
      extraction.detected_subject?.subject?.toLowerCase() ??
      "math";

    // Step 4: Subscription gate — check brain-svc active_tutors
    const access = await this.gate.verifyAccess(learnerId, detectedSubject);
    if (!access.allowed) {
      // Still create assignment record in FAILED state for tracking
      const [assignment] = await this.app.db
        .insert(homeworkAssignments)
        .values({
          learnerId,
          subject: detectedSubject,
          originalFileUrl: stored.url,
          originalFileType: mimeType,
          extractedText: extraction.raw_text ?? "",
          extractedProblems: extraction.problems ?? [],
          adaptedProblems: [],
          homeworkMode: "PRACTICE",
          status: "FAILED",
        })
        .returning();

      return {
        assignment,
        locked: true,
        requiredSku: access.requiredSku,
      };
    }

    // Step 5: Fetch brain context for adaptation
    const brainContext = await this.brainRelay.fetchContext(learnerId);

    // Step 6: Determine homework mode from functioning level
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    const functioningLevel = learner?.functioningLevel ?? "STANDARD";
    const homeworkMode = getHomeworkMode(functioningLevel);

    // Step 7: Adapt problems using full adaptation engine
    const adapted = (await this.app.aiClient.homeworkAdaptFull({
      extractedProblems: extraction.problems ?? [],
      brainContext: {
        ...brainContext,
        functioning_level: functioningLevel,
        communication_mode: learner?.communicationMode ?? "VERBAL",
        enrolled_grade: learner?.enrolledGrade ?? 5,
        active_accommodations: brainContext.learningPreferences?.accommodations ?? [],
        iep_goals: brainContext.learningPreferences?.iepGoals ?? [],
      },
      subject: detectedSubject,
    })) as {
      adapted_problems?: unknown[];
      parent_guide?: string;
      estimated_minutes?: number;
    };

    // Step 8: Persist assignment
    const [assignment] = await this.app.db
      .insert(homeworkAssignments)
      .values({
        learnerId,
        subject: detectedSubject,
        originalFileUrl: stored.url,
        originalFileType: mimeType,
        extractedText: extraction.raw_text ?? "",
        extractedProblems: extraction.problems ?? [],
        adaptedProblems: adapted.adapted_problems ?? [],
        homeworkMode,
        status: "READY",
      })
      .returning();

    // Step 9: Publish events
    await publishEvent(this.app.nats, "homework.uploaded", {
      learnerId,
      assignmentId: assignment.id,
      subject: detectedSubject,
      fileUrl: stored.url,
    });

    await publishEvent(this.app.nats, "homework.processed", {
      learnerId,
      assignmentId: assignment.id,
      problemCount: (adapted.adapted_problems ?? []).length,
      homeworkMode,
      functioningLevel,
    });

    return { assignment };
  }

  /**
   * Start a homework tutoring session with Socratic first prompt.
   */
  async startSession(
    assignmentId: string,
    learnerId: string,
  ): Promise<SessionResult> {
    // Load assignment
    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
    }

    // Subscription gate
    const access = await this.gate.verifyAccess(learnerId, assignment.subject);
    if (!access.allowed) {
      throw Object.assign(new Error(access.message ?? "Subscription required"), {
        statusCode: 403,
        locked: true,
        requiredSku: access.requiredSku,
      });
    }

    // Load brain context and learner
    const brainContext = await this.brainRelay.fetchContext(learnerId);
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    const functioningLevel = learner?.functioningLevel ?? "STANDARD";
    const homeworkMode = getHomeworkMode(functioningLevel);
    const tutorSku = getSkuForSubject(assignment.subject) ?? assignment.subject;

    // Generate first Socratic prompt
    const firstPrompt = this.generateFirstPrompt(
      assignment,
      functioningLevel,
      learner?.name ?? "friend",
    );

    const initialMessages = [
      {
        role: "assistant" as const,
        content: firstPrompt,
        timestamp: new Date().toISOString(),
      },
    ];

    // Create session
    const [session] = await this.app.db
      .insert(homeworkSessions)
      .values({
        homeworkAssignmentId: assignmentId,
        learnerId,
        tutorSku,
        messages: initialMessages,
        startedAt: new Date(),
      })
      .returning();

    // Update assignment status
    await this.app.db
      .update(homeworkAssignments)
      .set({ status: "IN_PROGRESS" })
      .where(eq(homeworkAssignments.id, assignmentId));

    await publishEvent(this.app.nats, "homework.session.started", {
      learnerId,
      assignmentId,
      sessionId: session.id,
      homeworkMode,
    });

    return { session, firstPrompt };
  }

  /**
   * Process a learner message in a homework session.
   */
  async sendMessage(
    sessionId: string,
    userInput: string,
    locale: string = "en",
  ): Promise<{
    content: string;
    problemProgress: { attempted: number; completed: number };
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw Object.assign(new Error("Homework session not found"), { statusCode: 404 });
    }

    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, session.homeworkAssignmentId))
      .limit(1);

    if (!assignment) {
      throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
    }

    const conversationHistory = (session.messages ?? []) as Array<{
      role: string;
      content: string;
    }>;

    const userMessage = {
      role: "user" as const,
      content: userInput,
      timestamp: new Date().toISOString(),
    };

    // Call AI tutor with homework context and locale
    const aiResponse = (await this.app.aiClient.tutorRespond({
      learnerId: session.learnerId,
      sessionId,
      subject: assignment.subject,
      messages: [
        ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content },
      ],
      brainContext: {
        adaptedProblems: assignment.adaptedProblems,
        homeworkMode: assignment.homeworkMode,
      },
      locale,
    })) as { content: string };

    const assistantMessage = {
      role: "assistant" as const,
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...conversationHistory, userMessage, assistantMessage];

    // Track problem progress from conversation
    const { attempted, completed } = this.trackProblemProgress(
      updatedMessages,
      assignment.adaptedProblems as unknown[],
    );

    const hintsUsed = updatedMessages.filter((m) => m.role === "assistant").length;

    await this.app.db
      .update(homeworkSessions)
      .set({
        messages: updatedMessages,
        hintsUsed,
        problemsAttempted: attempted,
        problemsCompleted: completed,
      })
      .where(eq(homeworkSessions.id, sessionId));

    return {
      content: aiResponse.content,
      problemProgress: { attempted, completed },
    };
  }

  /**
   * End a homework session and calculate completion metrics.
   */
  async endSession(sessionId: string) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw Object.assign(new Error("Homework session not found"), { statusCode: 404 });
    }

    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, session.homeworkAssignmentId))
      .limit(1);

    const now = new Date();
    const startedAt = new Date(session.startedAt);
    const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

    const totalProblems = Array.isArray(assignment?.adaptedProblems)
      ? (assignment.adaptedProblems as unknown[]).length
      : 0;
    const problemsCompleted = session.problemsCompleted ?? 0;
    const problemsAttempted = session.problemsAttempted ?? 0;
    const hintsUsed = session.hintsUsed ?? 0;

    // Completion quality scoring:
    // 1.0 = all completed without hints
    // 0.7 = all completed with some scaffolding
    // 0.4 = partial completion
    // 0.0 = abandoned
    let completionQuality = 0.0;
    if (totalProblems > 0) {
      const completionRatio = problemsCompleted / totalProblems;
      const hintPenalty = Math.min(hintsUsed * 0.05, 0.3);
      completionQuality = Math.max(0, Math.min(1, completionRatio - hintPenalty));
    }

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
      problemsAttempted,
      hintsUsed,
      durationSeconds,
    });

    return {
      ...updated,
      summary: {
        completionQuality,
        problemsAttempted,
        problemsCompleted,
        hintsUsed,
        durationSeconds,
        totalProblems,
      },
    };
  }

  async getAssignment(assignmentId: string) {
    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, assignmentId))
      .limit(1);
    return assignment ?? null;
  }

  async listAssignments(learnerId: string) {
    return this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.learnerId, learnerId))
      .orderBy(desc(homeworkAssignments.createdAt));
  }

  private async getSession(sessionId: string) {
    const [session] = await this.app.db
      .select()
      .from(homeworkSessions)
      .where(eq(homeworkSessions.id, sessionId))
      .limit(1);
    return session ?? null;
  }

  private generateFirstPrompt(
    assignment: typeof homeworkAssignments.$inferSelect,
    functioningLevel: string,
    learnerName: string,
  ): string {
    const problems = assignment.adaptedProblems as unknown[];
    const count = problems?.length ?? 0;

    if (functioningLevel === "NON_VERBAL" || functioningLevel === "PRE_SYMBOLIC") {
      return (
        `Hi! I've prepared a guide to help ${learnerName} work through this ` +
        `${assignment.subject} assignment. There are ${count} adapted activities. ` +
        `Let me know when you're ready to start with the first one, and I'll walk you through it step by step.`
      );
    }

    if (functioningLevel === "LOW_VERBAL") {
      return (
        `Hi ${learnerName}! Let's work on ${assignment.subject} together. ` +
        `We have ${count} problems. Ready for problem 1?`
      );
    }

    return (
      `Hey ${learnerName}! I'm here to help you work through your ` +
      `${assignment.subject} homework. We have ${count} problems to tackle. ` +
      `Let's start with problem 1 together. I won't give you the answer — ` +
      `instead, I'll help you figure it out step by step. Ready?`
    );
  }

  private trackProblemProgress(
    messages: Array<{ role: string; content: string }>,
    adaptedProblems: unknown[],
  ): { attempted: number; completed: number } {
    const totalProblems = adaptedProblems?.length ?? 0;
    if (totalProblems === 0) return { attempted: 0, completed: 0 };

    // Heuristic: count problem mentions in the conversation
    const fullConvo = messages.map((m) => m.content).join("\n").toLowerCase();
    let attempted = 0;
    let completed = 0;

    for (let i = 1; i <= totalProblems; i++) {
      const mentioned =
        fullConvo.includes(`problem ${i}`) ||
        fullConvo.includes(`question ${i}`) ||
        fullConvo.includes(`#${i}`);
      if (mentioned) attempted++;

      const completionIndicators = [
        `problem ${i} is correct`,
        `great job on problem ${i}`,
        `correct! let's move to problem ${i + 1}`,
        `you got problem ${i}`,
        `problem ${i} complete`,
      ];
      if (completionIndicators.some((ind) => fullConvo.includes(ind))) {
        completed++;
      }
    }

    return {
      attempted: Math.max(attempted, 1),
      completed: Math.min(completed, totalProblems),
    };
  }
}
