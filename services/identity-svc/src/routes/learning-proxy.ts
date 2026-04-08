/**
 * Proxy routes that forward learning-related requests to learning-svc.
 * Covers sessions, quests, gradebook, learning path, and goals.
 */
import type { FastifyPluginAsync } from "fastify";
import { loadConfig } from "../config.js";
import { getQueryString } from "./proxy-utils.js";

const { LEARNING_SVC_URL } = loadConfig();

async function proxyToLearning(
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

  try {
    const res = await fetch(`${LEARNING_SVC_URL}${path}`, {
      method,
      headers,
      body: method === "GET" ? undefined : body,
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 502, data: { error: "Learning service unavailable" } };
  }
}

export const learningProxyRoutes: FastifyPluginAsync = async (app) => {
  // ── Sessions ────────────────────────────────────────────────────────

  // POST /learning/sessions/start
  app.post("/learning/sessions/start", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning("/learning/sessions/start", token, "POST", JSON.stringify(request.body));
    return reply.status(status).send(data);
  });

  // POST /learning/sessions/:id/interact
  app.post<{ Params: { id: string } }>("/learning/sessions/:id/interact", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/sessions/${request.params.id}/interact`, token, "POST", JSON.stringify(request.body));
    return reply.status(status).send(data);
  });

  // POST /learning/sessions/:id/complete
  app.post<{ Params: { id: string } }>("/learning/sessions/:id/complete", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/sessions/${request.params.id}/complete`, token, "POST", JSON.stringify(request.body));
    return reply.status(status).send(data);
  });

  // GET /learning/sessions/:id
  app.get<{ Params: { id: string } }>("/learning/sessions/:id", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/sessions/${request.params.id}`, token);
    return reply.status(status).send(data);
  });

  // GET /learning/sessions/history/:learnerId
  app.get<{ Params: { learnerId: string } }>("/learning/sessions/history/:learnerId", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToLearning(`/learning/sessions/history/${request.params.learnerId}${queryString}`, token);
    return reply.status(status).send(data);
  });

  // ── Quests ──────────────────────────────────────────────────────────

  // GET /learning/quests/worlds
  app.get("/learning/quests/worlds", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToLearning(`/learning/quests/worlds${queryString}`, token);
    return reply.status(status).send(data);
  });

  // GET /learning/quests/worlds/:worldId
  app.get<{ Params: { worldId: string } }>("/learning/quests/worlds/:worldId", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/quests/worlds/${request.params.worldId}`, token);
    return reply.status(status).send(data);
  });

  // POST /learning/quests/start
  app.post("/learning/quests/start", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning("/learning/quests/start", token, "POST", JSON.stringify(request.body));
    return reply.status(status).send(data);
  });

  // GET /learning/quests/chapter/:chapterId
  app.get<{ Params: { chapterId: string } }>("/learning/quests/chapter/:chapterId", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/quests/chapter/${request.params.chapterId}`, token);
    return reply.status(status).send(data);
  });

  // POST /learning/quests/chapter/:chapterId/complete
  app.post<{ Params: { chapterId: string } }>("/learning/quests/chapter/:chapterId/complete", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/quests/chapter/${request.params.chapterId}/complete`, token, "POST", JSON.stringify(request.body));
    return reply.status(status).send(data);
  });

  // GET /learning/quests/progress
  app.get("/learning/quests/progress", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToLearning(`/learning/quests/progress${queryString}`, token);
    return reply.status(status).send(data);
  });

  // ── Gradebook ───────────────────────────────────────────────────────

  // GET /learning/gradebook
  app.get("/learning/gradebook", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToLearning(`/learning/gradebook${queryString}`, token);
    return reply.status(status).send(data);
  });

  // GET /learning/gradebook/subject/:subject
  app.get<{ Params: { subject: string } }>("/learning/gradebook/subject/:subject", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToLearning(`/learning/gradebook/subject/${request.params.subject}${queryString}`, token);
    return reply.status(status).send(data);
  });

  // GET /learning/gradebook/skill/:skillId
  app.get<{ Params: { skillId: string } }>("/learning/gradebook/skill/:skillId", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToLearning(`/learning/gradebook/skill/${request.params.skillId}${queryString}`, token);
    return reply.status(status).send(data);
  });

  // ── Learning Path ───────────────────────────────────────────────────

  // GET /learning/learning-path/:learnerId
  app.get<{ Params: { learnerId: string } }>("/learning/learning-path/:learnerId", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/path/${request.params.learnerId}`, token);
    return reply.status(status).send(data);
  });

  // GET /learning/learning-path/:learnerId/next
  app.get<{ Params: { learnerId: string } }>("/learning/learning-path/:learnerId/next", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/path/${request.params.learnerId}/next`, token);
    return reply.status(status).send(data);
  });

  // ── Goals ───────────────────────────────────────────────────────────

  // GET /learning/goals
  app.get("/learning/goals", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const queryString = getQueryString(request.url);
    const { status, data } = await proxyToLearning(`/learning/goals${queryString}`, token);
    return reply.status(status).send(data);
  });

  // POST /learning/goals
  app.post("/learning/goals", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning("/learning/goals", token, "POST", JSON.stringify(request.body));
    return reply.status(status).send(data);
  });

  // PATCH /learning/goals/:goalId
  app.patch<{ Params: { goalId: string } }>("/learning/goals/:goalId", async (request, reply) => {
    const token = request.cookies?.access_token ?? request.headers.authorization?.replace("Bearer ", "");
    const { status, data } = await proxyToLearning(`/learning/goals/${request.params.goalId}`, token, "PATCH", JSON.stringify(request.body));
    return reply.status(status).send(data);
  });
};
