import type { FastifyInstance } from "fastify";
import { eq, desc, and } from "drizzle-orm";
import { brainEpisodes, brainStates } from "@aivo/db";

export interface Insight {
  id: string;
  text: string;
  attribution: string;
  userId: string;
  createdAt: string;
}

export class InsightService {
  constructor(private readonly app: FastifyInstance) {}

  async submitInsight(
    learnerId: string,
    userId: string,
    text: string,
    attribution: "parent" | "teacher" | "caregiver",
  ): Promise<Insight> {
    // Push insight to Brain context layer
    await this.app.brainClient.addInsight(learnerId, {
      text,
      attribution,
      userId,
    });

    // Also store as a brain episode locally
    const [brainState] = await this.app.db
      .select()
      .from(brainStates)
      .where(eq(brainStates.learnerId, learnerId))
      .limit(1);

    if (brainState) {
      await this.app.db.insert(brainEpisodes).values({
        brainStateId: brainState.id,
        eventType: `insight.${attribution}`,
        payload: { text, attribution, userId },
      });
    }

    return {
      id: crypto.randomUUID(),
      text,
      attribution,
      userId,
      createdAt: new Date().toISOString(),
    };
  }

  async getInsights(learnerId: string, limit = 50): Promise<Insight[]> {
    const [brainState] = await this.app.db
      .select()
      .from(brainStates)
      .where(eq(brainStates.learnerId, learnerId))
      .limit(1);

    if (!brainState) return [];

    const episodes = await this.app.db
      .select()
      .from(brainEpisodes)
      .where(
        and(
          eq(brainEpisodes.brainStateId, brainState.id),
          eq(brainEpisodes.eventType, "insight.parent"),
        ),
      )
      .orderBy(desc(brainEpisodes.createdAt))
      .limit(limit);

    // Also get teacher insights
    const teacherEpisodes = await this.app.db
      .select()
      .from(brainEpisodes)
      .where(
        and(
          eq(brainEpisodes.brainStateId, brainState.id),
          eq(brainEpisodes.eventType, "insight.teacher"),
        ),
      )
      .orderBy(desc(brainEpisodes.createdAt))
      .limit(limit);

    const all = [...episodes, ...teacherEpisodes]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return all.map((ep) => {
      const payload = ep.payload as { text: string; attribution: string; userId: string };
      return {
        id: ep.id,
        text: payload.text,
        attribution: payload.attribution,
        userId: payload.userId,
        createdAt: ep.createdAt.toISOString(),
      };
    });
  }
}
