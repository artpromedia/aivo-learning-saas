/**
 * Proxy routes that forward brain-related requests to brain-svc.
 * Acts as an API gateway: extracts JWT from cookies and forwards
 * as Bearer token to brain-svc.
 * The seed endpoint writes directly to Postgres since brain-svc
 * doesn't expose a seed API.
 */
import type { FastifyPluginAsync } from "fastify";
import { sql } from "drizzle-orm";

const BRAIN_SVC_URL =
  process.env.BRAIN_SVC_URL ?? "http://localhost:3002";

async function proxyToBrain(
  path: string,
  accessToken: string | undefined,
  method = "GET",
  body?: string
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BRAIN_SVC_URL}${path}`, {
    method,
    headers,
    body: method === "GET" ? undefined : body,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function transformBrainProfile(data: unknown) {
  const bs = data as Record<string, unknown>;
  const state = (bs.state ?? {}) as Record<string, unknown>;
  const flp = (bs.functioning_level_profile ?? {}) as Record<string, unknown>;
  return {
    id: bs.id,
    learnerId: bs.learner_id,
    functioningLevel: flp.level ?? "level2",
    strengths: state.strengths ?? [],
    challenges: state.challenges ?? [],
    learningStyle: (bs.preferred_modality as string) ?? "multi-sensory",
    sensoryPreferences: state.sensory_preferences ?? [],
    communicationStyle: state.communication_style ?? "verbal",
    status: state.approval_status ?? "pending",
    createdAt: bs.created_at ?? new Date().toISOString(),
    updatedAt: bs.updated_at ?? new Date().toISOString(),
  };
}

/* ── Brain Profile ─────────────────────────────────────── */

export const brainProxyRoutes: FastifyPluginAsync = async (app) => {
  // GET /learners/:learnerId/brain-profile
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/brain-profile",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/brain/learner/${learnerId}`,
        token
      );

      if (status === 404) return reply.send(null);
      if (status !== 200) return reply.status(status).send(data);

      return reply.send(transformBrainProfile(data));
    }
  );

  // POST /learners/:learnerId/brain-profile/approve
  app.post<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/brain-profile/approve",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;

      const { status, data } = await proxyToBrain(
        `/brain/learner/${learnerId}`,
        token
      );
      if (status !== 200) return reply.status(status).send(data);

      const bs = data as Record<string, unknown>;
      const state = (bs.state ?? {}) as Record<string, unknown>;
      state.approval_status = "approved";

      const patchRes = await proxyToBrain(
        `/brain/${String(bs.id)}`,
        token,
        "PATCH",
        JSON.stringify({ state })
      );
      return reply.status(patchRes.status).send({ ok: true });
    }
  );

  // POST /learners/:learnerId/brain-profile/decline
  app.post<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/brain-profile/decline",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;

      const { status, data } = await proxyToBrain(
        `/brain/learner/${learnerId}`,
        token
      );
      if (status !== 200) return reply.status(status).send(data);

      const bs = data as Record<string, unknown>;
      const state = (bs.state ?? {}) as Record<string, unknown>;
      state.approval_status = "declined";

      const patchRes = await proxyToBrain(
        `/brain/${String(bs.id)}`,
        token,
        "PATCH",
        JSON.stringify({ state })
      );
      return reply.status(patchRes.status).send({ ok: true });
    }
  );

  // POST /learners/:learnerId/brain-profile/insights
  app.post<{ Params: { learnerId: string }; Body: { text: string } }>(
    "/learners/:learnerId/brain-profile/insights",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;

      const { status, data } = await proxyToBrain(
        `/brain/learner/${learnerId}`,
        token
      );
      if (status !== 200) return reply.status(status).send(data);

      const bs = data as Record<string, unknown>;
      const state = (bs.state ?? {}) as Record<string, unknown>;
      const insights = (state.parent_insights ?? []) as string[];
      insights.push((request.body as { text: string }).text);
      state.parent_insights = insights;

      const patchRes = await proxyToBrain(
        `/brain/${String(bs.id)}`,
        token,
        "PATCH",
        JSON.stringify({ state })
      );
      return reply.status(patchRes.status).send({ ok: true });
    }
  );

  // POST /learners/:learnerId/brain-profile/seed
  // Creates a seed brain state from baseline assessment results
  // when clone_brain hasn't fired via NATS yet.
  // Writes directly to Postgres since brain-svc doesn't expose a seed API.
  app.post<{ Params: { learnerId: string }; Body: { accuracy?: number } }>(
    "/learners/:learnerId/brain-profile/seed",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;

      // Check if brain state already exists via brain-svc
      const existing = await proxyToBrain(
        `/brain/learner/${learnerId}`,
        token
      );
      if (existing.status === 200) {
        return reply.send({ ok: true, created: false });
      }

      // Determine functioning level from accuracy
      const accuracy = (request.body as { accuracy?: number })?.accuracy ?? 0.5;
      let functioningLevel = "level2";
      if (accuracy >= 0.75) functioningLevel = "level1";
      else if (accuracy < 0.4) functioningLevel = "level3";

      const strengthMap: Record<string, string[]> = {
        level1: ["Independent learning", "Quick comprehension", "Strong recall"],
        level2: ["Visual learning", "Pattern recognition", "Creative thinking"],
        level3: ["Hands-on activities", "Visual aids", "Structured routines"],
      };
      const challengeMap: Record<string, string[]> = {
        level1: ["Advanced problem-solving", "Time management"],
        level2: ["Reading comprehension", "Multi-step problems"],
        level3: ["Abstract concepts", "Working memory", "Attention span"],
      };

      // Insert directly into shared Postgres
      const stateJson = JSON.stringify({
        mastery_levels: {},
        domain_scores: { math: accuracy, reading: accuracy },
        strengths: strengthMap[functioningLevel],
        challenges: challengeMap[functioningLevel],
        sensory_preferences: ["visual", "auditory"],
        communication_style: "verbal",
        approval_status: "pending",
      });
      const flpJson = JSON.stringify({ level: functioningLevel });
      let attentionSpan = 30;
      if (functioningLevel === "level3") attentionSpan = 10;
      else if (functioningLevel === "level2") attentionSpan = 20;

      await app.db.execute(
        sql`INSERT INTO brain_states (
              learner_id, main_brain_version, seed_version, state,
              functioning_level_profile, preferred_modality,
              attention_span_minutes, cognitive_load
            ) VALUES (
              ${learnerId}::uuid, 'v1.0', 'baseline-seed',
              ${stateJson}::jsonb,
              ${flpJson}::jsonb,
              'multi-sensory',
              ${attentionSpan},
              'MEDIUM'
            )
            ON CONFLICT (learner_id) DO NOTHING`
      );

      return reply.send({ ok: true, created: true });
    }
  );

  /* ── Recommendations ─────────────────────────────────── */

  // GET /learners/:learnerId/recommendations
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/recommendations",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/recommendations/learner/${learnerId}`,
        token
      );

      if (status === 404) return reply.send([]);
      if (status !== 200) return reply.status(status).send(data);

      // Transform array
      const recs = (data as Record<string, unknown>[]).map((r) => ({
        id: r.id,
        learnerId: r.learner_id,
        title: r.title,
        description: r.description,
        type: (r.type as string)?.toLowerCase() ?? "activity",
        priority:
          ((r.payload as Record<string, unknown>)?.priority as string)
            ?.toLowerCase() ?? "medium",
        status: (r.status as string)?.toLowerCase() ?? "pending",
        reasoning:
          ((r.payload as Record<string, unknown>)?.reasoning as string) ?? "",
        createdAt: r.created_at ?? new Date().toISOString(),
      }));

      return reply.send(recs);
    }
  );

  // POST /learners/:learnerId/recommendations/:recId/approve
  app.post<{ Params: { learnerId: string; recId: string } }>(
    "/learners/:learnerId/recommendations/:recId/approve",
    async (request, reply) => {
      const { recId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/recommendations/${recId}/respond`,
        token,
        "POST",
        JSON.stringify({ status: "APPROVED", responded_by: "parent" })
      );
      return reply.status(status).send(data);
    }
  );

  // POST /learners/:learnerId/recommendations/:recId/decline
  app.post<{ Params: { learnerId: string; recId: string } }>(
    "/learners/:learnerId/recommendations/:recId/decline",
    async (request, reply) => {
      const { recId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/recommendations/${recId}/respond`,
        token,
        "POST",
        JSON.stringify({ status: "DECLINED", responded_by: "parent" })
      );
      return reply.status(status).send(data);
    }
  );

  // POST /learners/:learnerId/recommendations/:recId/adjust
  app.post<{ Params: { learnerId: string; recId: string } }>(
    "/learners/:learnerId/recommendations/:recId/adjust",
    async (request, reply) => {
      const { recId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/recommendations/${recId}/respond`,
        token,
        "POST",
        JSON.stringify({ status: "ADJUSTED", responded_by: "parent" })
      );
      return reply.status(status).send(data);
    }
  );

  /* ── Gradebook / Mastery ─────────────────────────────── */

  // GET /learners/:learnerId/gradebook/mastery
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/gradebook/mastery",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/mastery/learner/${learnerId}`,
        token
      );

      if (status === 404) {
        return reply.send({
          subjects: [],
          overallMastery: 0,
          totalSessions: 0,
        });
      }
      if (status !== 200) return reply.status(status).send(data);

      const mastery = data as Record<string, unknown>;
      const domainScores = (mastery.domain_scores ?? {}) as Record<
        string,
        number
      >;

      const subjects = Object.entries(domainScores).map(([name, score]) => ({
        subject: name,
        currentMastery: Math.round(score * 100),
        trend: "stable" as const,
        history: [],
      }));

      const overall =
        subjects.length > 0
          ? Math.round(
              subjects.reduce((s, x) => s + x.currentMastery, 0) /
                subjects.length
            )
          : 0;

      return reply.send({
        subjects,
        overallMastery: overall,
        totalSessions: 0,
      });
    }
  );

  // GET /learners/:learnerId/gradebook (summary alias)
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/gradebook",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/mastery/learner/${learnerId}`,
        token
      );

      if (status === 404 || status !== 200) {
        return reply.send({
          subjects: [],
          overallMastery: 0,
          totalSessions: 0,
        });
      }

      const mastery = data as Record<string, unknown>;
      const domainScores = (mastery.domain_scores ?? {}) as Record<
        string,
        number
      >;

      const subjects = Object.entries(domainScores).map(([name, score]) => ({
        subject: name,
        currentMastery: Math.round(score * 100),
        trend: "stable" as const,
        history: [],
      }));

      const overall =
        subjects.length > 0
          ? Math.round(
              subjects.reduce((s, x) => s + x.currentMastery, 0) /
                subjects.length
            )
          : 0;

      return reply.send({
        subjects,
        overallMastery: overall,
        totalSessions: 0,
      });
    }
  );

  /* ── Functioning Level ───────────────────────────────── */

  // GET /learners/:learnerId/functioning-level
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/functioning-level",
    async (request, reply) => {
      const { learnerId } = request.params;
      const token = request.cookies.access_token;
      const { status, data } = await proxyToBrain(
        `/functional/learner/${learnerId}`,
        token
      );

      if (status === 404) return reply.send([]);
      if (status !== 200) return reply.status(status).send(data);
      return reply.send(data);
    }
  );

  /* ── Engagement (service not yet built — return defaults) ── */

  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement",
    async (_request, reply) => {
      return reply.send({
        xp: { totalXp: 0, weeklyXp: 0, dailyXp: 0, xpToNextLevel: 100 },
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date().toISOString(),
        },
        badges: [],
        level: { level: 1, title: "Beginner", currentXp: 0, requiredXp: 100 },
      });
    }
  );

  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/xp",
    async (_request, reply) => {
      return reply.send({
        totalXp: 0,
        weeklyXp: 0,
        dailyXp: 0,
        xpToNextLevel: 100,
      });
    }
  );

  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/streaks",
    async (_request, reply) => {
      return reply.send({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString(),
      });
    }
  );

  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/badges",
    async (_request, reply) => {
      return reply.send([]);
    }
  );

  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/level",
    async (_request, reply) => {
      return reply.send({
        level: 1,
        title: "Beginner",
        currentXp: 0,
        requiredXp: 100,
      });
    }
  );

  /* ── Progress (service not yet built — return defaults) ── */

  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/progress",
    async (_request, reply) => {
      return reply.send({
        overallMastery: 0,
        sessionsThisWeek: 0,
        averageAccuracy: 0,
        recentSubjects: [],
      });
    }
  );
};
