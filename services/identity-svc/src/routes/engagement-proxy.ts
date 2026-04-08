/**
 * Proxy routes that forward engagement-related requests to engagement-svc.
 * Covers XP, streaks, badges, level, shop, and avatar endpoints.
 */
import type { FastifyPluginAsync } from "fastify";
import { loadConfig } from "../config.js";
import { getQueryString, getToken } from "./proxy-utils.js";

const { ENGAGEMENT_SVC_URL } = loadConfig();

async function proxyToEngagement(
  path: string,
  accessToken: string | undefined,
  method = "GET",
  body?: string,
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(`${ENGAGEMENT_SVC_URL}${path}`, {
      method,
      headers,
      body: method === "GET" ? undefined : body,
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 502, data: { error: "Engagement service unavailable" } };
  }
}

export const engagementProxyRoutes: FastifyPluginAsync = async (app) => {
  // ── XP ─────────────────────────────────────────────────────────────

  // GET /api/learners/:learnerId/engagement/xp → engagement-svc GET /engagement/xp/:learnerId
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/xp",
    async (request, reply) => {
      const token = getToken(request);
      const { status, data } = await proxyToEngagement(
        `/engagement/xp/${request.params.learnerId}`,
        token,
      );
      return reply.status(status).send(data);
    },
  );

  // ── Streaks ────────────────────────────────────────────────────────

  // GET /api/learners/:learnerId/engagement/streaks → engagement-svc GET /engagement/streaks/:learnerId
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/streaks",
    async (request, reply) => {
      const token = getToken(request);
      const { status, data } = await proxyToEngagement(
        `/engagement/streaks/${request.params.learnerId}`,
        token,
      );
      return reply.status(status).send(data);
    },
  );

  // ── Badges ─────────────────────────────────────────────────────────

  // GET /api/learners/:learnerId/engagement/badges → engagement-svc GET /engagement/badges/:learnerId
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/badges",
    async (request, reply) => {
      const token = getToken(request);
      const { status, data } = await proxyToEngagement(
        `/engagement/badges/${request.params.learnerId}`,
        token,
      );
      return reply.status(status).send(data);
    },
  );

  // ── Level ──────────────────────────────────────────────────────────

  // GET /api/learners/:learnerId/engagement/level → derived from engagement-svc XP summary
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement/level",
    async (request, reply) => {
      const token = getToken(request);
      const { status, data } = await proxyToEngagement(
        `/engagement/xp/${request.params.learnerId}`,
        token,
      );
      if (status !== 200 || !data) {
        return reply.status(status).send(data);
      }
      const xpData = data as Record<string, unknown>;
      return reply.status(200).send({
        level: xpData.level ?? 1,
        title: `Level ${xpData.level ?? 1}`,
        currentXp: (xpData.totalXp as number) - ((xpData.currentLevelXp as number) ?? 0),
        requiredXp: ((xpData.nextLevelXp as number) ?? 0) - ((xpData.currentLevelXp as number) ?? 0),
      });
    },
  );

  // ── Engagement Summary ─────────────────────────────────────────────

  // GET /api/learners/:learnerId/engagement → composite from xp + streaks + badges
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/engagement",
    async (request, reply) => {
      const token = getToken(request);
      const learnerId = request.params.learnerId;

      const [xpResult, streakResult, badgeResult] = await Promise.all([
        proxyToEngagement(`/engagement/xp/${learnerId}`, token),
        proxyToEngagement(`/engagement/streaks/${learnerId}`, token),
        proxyToEngagement(`/engagement/badges/${learnerId}`, token),
      ]);

      if (xpResult.status !== 200) {
        return reply.status(xpResult.status).send(xpResult.data);
      }

      const xpData = xpResult.data as Record<string, unknown>;
      const streakData = (streakResult.data ?? {}) as Record<string, unknown>;
      const badgeData = badgeResult.data as { badges?: unknown[] } | null;

      return reply.status(200).send({
        xp: {
          totalXp: xpData.totalXp ?? 0,
          weeklyXp: xpData.weeklyXp ?? 0,
          dailyXp: xpData.dailyXp ?? 0,
          xpToNextLevel: ((xpData.nextLevelXp as number) ?? 0) - ((xpData.totalXp as number) ?? 0),
        },
        streak: {
          currentStreak: streakData.currentStreak ?? xpData.currentStreakDays ?? 0,
          longestStreak: streakData.longestStreak ?? xpData.longestStreakDays ?? 0,
          lastActiveDate: streakData.lastActiveDate ?? null,
        },
        badges: badgeData?.badges ?? [],
        level: {
          level: xpData.level ?? 1,
          title: `Level ${xpData.level ?? 1}`,
          currentXp: (xpData.totalXp as number) - ((xpData.currentLevelXp as number) ?? 0),
          requiredXp: ((xpData.nextLevelXp as number) ?? 0) - ((xpData.currentLevelXp as number) ?? 0),
        },
      });
    },
  );

  // ── Shop ───────────────────────────────────────────────────────────

  // GET /api/shop/items → engagement-svc GET /engagement/shop/catalog
  app.get("/shop/items", async (request, reply) => {
    const token = getToken(request);
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToEngagement(
      `/engagement/shop/catalog${queryString}`,
      token,
    );
    return reply.status(status).send(data);
  });

  // POST /api/shop/purchase → engagement-svc POST /engagement/shop/purchase
  app.post("/shop/purchase", async (request, reply) => {
    const token = getToken(request);
    const { status, data } = await proxyToEngagement(
      "/engagement/shop/purchase",
      token,
      "POST",
      JSON.stringify(request.body),
    );
    return reply.status(status).send(data);
  });

  // ── Avatar ─────────────────────────────────────────────────────────

  // GET /api/learners/:learnerId/avatar → engagement-svc GET /engagement/avatar/:learnerId
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/avatar",
    async (request, reply) => {
      const token = getToken(request);
      const { status, data } = await proxyToEngagement(
        `/engagement/avatar/${request.params.learnerId}`,
        token,
      );
      return reply.status(status).send(data);
    },
  );

  // PUT /api/learners/:learnerId/avatar → engagement-svc PUT /engagement/avatar/:learnerId
  app.put<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/avatar",
    async (request, reply) => {
      const token = getToken(request);
      const { status, data } = await proxyToEngagement(
        `/engagement/avatar/${request.params.learnerId}`,
        token,
        "PUT",
        JSON.stringify(request.body),
      );
      return reply.status(status).send(data);
    },
  );

  // ── Quests (proxy to learning-svc via engagement path mapping) ─────

  // GET /api/learners/:learnerId/quests/worlds → learning-svc GET /learning/quests/worlds?learnerId=...
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/quests/worlds",
    async (request, reply) => {
      const token = getToken(request);
      const { LEARNING_SVC_URL } = loadConfig();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const res = await fetch(
          `${LEARNING_SVC_URL}/learning/quests/worlds?learnerId=${request.params.learnerId}`,
          { method: "GET", headers },
        );
        const data = await res.json().catch(() => null);
        return reply.status(res.status).send(data);
      } catch {
        return reply.status(502).send({ error: "Learning service unavailable" });
      }
    },
  );

  // GET /api/learners/:learnerId/quests/:questId → learning-svc GET /learning/quests/worlds/:worldId
  app.get<{ Params: { learnerId: string; questId: string } }>(
    "/learners/:learnerId/quests/:questId",
    async (request, reply) => {
      const token = getToken(request);
      const { LEARNING_SVC_URL } = loadConfig();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const res = await fetch(
          `${LEARNING_SVC_URL}/learning/quests/worlds/${request.params.questId}?learnerId=${request.params.learnerId}`,
          { method: "GET", headers },
        );
        const data = await res.json().catch(() => null);
        return reply.status(res.status).send(data);
      } catch {
        return reply.status(502).send({ error: "Learning service unavailable" });
      }
    },
  );

  // ── Profile Stats ──────────────────────────────────────────────────

  // GET /api/learners/:learnerId/profile/stats → composite from engagement-svc + learning-svc
  app.get<{ Params: { learnerId: string } }>(
    "/learners/:learnerId/profile/stats",
    async (request, reply) => {
      const token = getToken(request);
      const learnerId = request.params.learnerId;
      const { LEARNING_SVC_URL } = loadConfig();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch data from multiple sources in parallel
      const [xpResult, historyResult] = await Promise.all([
        proxyToEngagement(`/engagement/xp/${learnerId}`, token),
        fetch(`${LEARNING_SVC_URL}/learning/sessions/history/${learnerId}?limit=1000`, {
          method: "GET",
          headers,
        })
          .then(async (res) => ({ status: res.status, data: await res.json().catch(() => null) }))
          .catch(() => ({ status: 502, data: null })),
      ]);

      const sessions = Array.isArray(historyResult.data) ? historyResult.data : [];

      return reply.status(200).send({
        totalSessions: sessions.length,
        questsCompleted: 0,
        challengesWon: 0,
        homeworkHelped: 0,
        joinedAt: new Date().toISOString(),
      });
    },
  );
};
