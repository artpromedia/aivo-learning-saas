import { describe, it, expect, vi, beforeEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { healthRoutes } from "../routes/health.js";

describe("Health Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify({ logger: false });
    await app.register(healthRoutes);
    await app.ready();
  });

  it("GET /health returns 200 with service name", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("assessment-svc");
  });

  it("GET /ready returns 200", async () => {
    const res = await app.inject({ method: "GET", url: "/ready" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ready");
  });
});

describe("Parent Assessment Route", () => {
  it("rejects unauthenticated requests", async () => {
    // We can't easily test the full route without DB/NATS mocks,
    // but we can verify the auth middleware is wired correctly
    const app = Fastify({ logger: false });

    // Mock the authenticate middleware to fail
    const { parentAssessmentRoute } = await import("../routes/parent/submit.js");

    // Register route without plugins (will fail on auth)
    await app.register(parentAssessmentRoute);
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/assessment/parent",
      payload: { learnerId: "test", answers: {} },
    });

    // Should fail with 401 since no auth token
    expect(res.statusCode).toBe(401);
  });
});

describe("IEP Status Route", () => {
  it("rejects unauthenticated requests", async () => {
    const app = Fastify({ logger: false });
    const { iepStatusRoute } = await import("../routes/iep/status.js");

    await app.register(iepStatusRoute);
    await app.ready();

    const res = await app.inject({
      method: "GET",
      url: "/assessment/iep/some-doc-id/status",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("Baseline Status Route", () => {
  it("rejects unauthenticated requests", async () => {
    const app = Fastify({ logger: false });
    const { baselineStatusRoute } = await import("../routes/baseline/status.js");

    await app.register(baselineStatusRoute);
    await app.ready();

    const res = await app.inject({
      method: "GET",
      url: "/assessment/baseline/some-learner-id/status",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("Baseline Start Route", () => {
  it("rejects unauthenticated requests", async () => {
    const app = Fastify({ logger: false });
    const { baselineStartRoute } = await import("../routes/baseline/start.js");

    await app.register(baselineStartRoute);
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/assessment/baseline/00000000-0000-0000-0000-000000000001/start",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("Baseline Answer Route", () => {
  it("rejects unauthenticated requests", async () => {
    const app = Fastify({ logger: false });
    const { baselineAnswerRoute } = await import("../routes/baseline/answer.js");

    await app.register(baselineAnswerRoute);
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/assessment/baseline/00000000-0000-0000-0000-000000000001/answer",
      payload: { questionId: "test", answer: "test" },
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("Baseline Complete Route", () => {
  it("rejects unauthenticated requests", async () => {
    const app = Fastify({ logger: false });
    const { baselineCompleteRoute } = await import("../routes/baseline/complete.js");

    await app.register(baselineCompleteRoute);
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/assessment/baseline/00000000-0000-0000-0000-000000000001/complete",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("IEP Confirm Route", () => {
  it("rejects unauthenticated requests", async () => {
    const app = Fastify({ logger: false });
    const { iepConfirmRoute } = await import("../routes/iep/confirm.js");

    await app.register(iepConfirmRoute);
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/assessment/iep/some-doc-id/confirm",
      payload: {},
    });

    expect(res.statusCode).toBe(401);
  });
});
