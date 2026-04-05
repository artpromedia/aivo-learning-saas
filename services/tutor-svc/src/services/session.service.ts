import { eq, desc } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { tutorSessions } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { BrainRelayService } from "./brain-relay.service.js";
import { getSubjectForSku } from "../data/tutor-catalog.js";
import { TUTOR_CATALOG } from "../data/tutor-catalog.js";

export class SessionService {
  private brainRelay: BrainRelayService;

  constructor(private readonly app: FastifyInstance) {
    this.brainRelay = new BrainRelayService(app);
  }

  async startSession(
    learnerId: string,
    sku: string,
    subject: string,
    sessionType: string,
    locale: string = "en",
  ) {
    // Load brain context for the learner
    const brainContext = await this.brainRelay.fetchContext(learnerId);

    const [session] = await this.app.db
      .insert(tutorSessions)
      .values({
        learnerId,
        tutorSku: sku as typeof tutorSessions.$inferInsert.tutorSku,
        subject,
        sessionType: sessionType as typeof tutorSessions.$inferInsert.sessionType,
        locale,
        brainContextSnapshot: brainContext,
        messages: [],
        startedAt: new Date(),
      })
      .returning();

    await publishEvent(this.app.nats, "tutor.session.started", {
      learnerId,
      tutorSku: sku,
      sessionId: session.id,
    });

    return session;
  }

  async sendMessage(sessionId: string, userInput: string, localeOverride?: string) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw Object.assign(new Error("Session not found"), {
        statusCode: 404,
      });
    }

    // Determine persona from catalog
    const catalogItem = TUTOR_CATALOG.find(
      (item) => item.sku === session.tutorSku,
    );
    const persona = catalogItem?.persona ?? "nova";

    // Build conversation history from existing messages
    const conversationHistory = (session.messages ?? []) as Array<{ role: string; content: string; timestamp?: string }>;

    // Add user message to history
    const userMessage = {
      role: "user" as const,
      content: userInput,
      timestamp: new Date().toISOString(),
    };

    // Call AI tutor with brain context, conversation history, persona, and locale
    const aiResponse = (await this.app.aiClient.tutorRespond({
      learnerId: session.learnerId,
      sessionId,
      subject: session.subject,
      messages: [...(conversationHistory as Array<{ role: string; content: string }>), { role: userMessage.role, content: userMessage.content }],
      brainContext: session.brainContextSnapshot as Record<string, unknown>,
      locale: localeOverride ?? (session as { locale?: string }).locale ?? "en",
    })) as { content: string; masterySignals?: Record<string, unknown> | null };

    const assistantMessage = {
      role: "assistant" as const,
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
      masterySignals: aiResponse.masterySignals ?? null,
    };

    // Append both messages to session
    const updatedMessages = [
      ...conversationHistory,
      userMessage,
      assistantMessage,
    ];

    await this.app.db
      .update(tutorSessions)
      .set({
        messages: updatedMessages,
        masteryUpdates: aiResponse.masterySignals ?? session.masteryUpdates,
      })
      .where(eq(tutorSessions.id, sessionId));

    return {
      content: aiResponse.content,
      masterySignals: aiResponse.masterySignals ?? null,
    };
  }

  async endSession(sessionId: string) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw Object.assign(new Error("Session not found"), {
        statusCode: 404,
      });
    }

    const now = new Date();
    const startedAt = new Date(session.startedAt);
    const durationSeconds = Math.floor(
      (now.getTime() - startedAt.getTime()) / 1000,
    );

    const messages = (session.messages ?? []) as Array<{ role: string; content: string }>;
    const userMessages = messages.filter(
      (m) => m.role === "user",
    );
    const assistantMessages = messages.filter(
      (m) => m.role === "assistant",
    );

    const engagementMetrics = {
      durationSeconds,
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageResponseLength:
        assistantMessages.length > 0
          ? Math.round(
              assistantMessages.reduce(
                (sum: number, m: { content: string }) =>
                  sum + m.content.length,
                0,
              ) / assistantMessages.length,
            )
          : 0,
    };

    const [updated] = await this.app.db
      .update(tutorSessions)
      .set({
        endedAt: now,
        engagementMetrics,
      })
      .where(eq(tutorSessions.id, sessionId))
      .returning();

    await publishEvent(this.app.nats, "tutor.session.completed", {
      learnerId: session.learnerId,
      tutorSku: session.tutorSku,
      sessionId: session.id,
      masteryUpdates: (session.masteryUpdates as Record<string, unknown>) ?? {},
      engagementMetrics,
    });

    return updated;
  }

  async getSession(sessionId: string) {
    const [session] = await this.app.db
      .select()
      .from(tutorSessions)
      .where(eq(tutorSessions.id, sessionId))
      .limit(1);

    return session ?? null;
  }

  async getHistory(learnerId: string, limit = 20) {
    return this.app.db
      .select()
      .from(tutorSessions)
      .where(eq(tutorSessions.learnerId, learnerId))
      .orderBy(desc(tutorSessions.createdAt))
      .limit(limit);
  }
}
