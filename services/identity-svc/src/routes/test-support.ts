/**
 * Test-support routes — registered ONLY when NODE_ENV !== 'production'.
 *
 * These routes match the API contract expected by the e2e test fixtures
 * (e.g. /auth/sign-up, /auth/sign-in, /test/verify-email).
 * They are registered WITHOUT the /api prefix.
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { hash } from "argon2";
import { nanoid } from "nanoid";
import { users, sessions, accounts, tenants } from "@aivo/db";
import { authenticate } from "../middleware/authenticate.js";

const signUpBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
  role: z
    .enum(["parent", "teacher", "district_admin", "caregiver", "platform_admin"])
    .optional()
    .default("parent"),
});

const signInBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

const verifyEmailBodySchema = z.object({
  email: z.string().email(),
});

export async function testSupportRoutes(app: FastifyInstance) {
  // In-memory token blacklist for sign-out simulation
  const revokedTokens = new Set<string>();

  // ── POST /auth/sign-up ─────────────────────────────────────────────
  // Test-friendly registration with role support + token in response body.
  app.post("/auth/sign-up", async (request, reply) => {
    const body = signUpBodySchema.parse(request.body);
    const role = body.role.toUpperCase() as
      | "PARENT"
      | "TEACHER"
      | "DISTRICT_ADMIN"
      | "CAREGIVER"
      | "PLATFORM_ADMIN";

    // Check existing
    const existing = await app.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return reply
        .status(409)
        .send({ error: "Email already registered" });
    }

    const passwordHash = await hash(body.password);
    const slug = `test-${nanoid(10)}`.toLowerCase();

    const tenantType = ["DISTRICT_ADMIN", "PLATFORM_ADMIN"].includes(role)
      ? "B2B_DISTRICT"
      : "B2C_FAMILY";

    const [tenant] = await app.db
      .insert(tenants)
      .values({
        name: `${body.name}'s Org`,
        slug,
        type: tenantType,
        status: "ACTIVE",
      })
      .returning();

    const [user] = await app.db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: body.email.toLowerCase(),
        name: body.name,
        role,
        status: "ACTIVE",
      })
      .returning();

    await app.db.insert(accounts).values({
      userId: user.id,
      providerId: "credential",
      providerAccountId: user.id,
      accessToken: passwordHash,
    });

    const accessToken = await app.auth.signAccessToken({
      sub: user.id,
      tenantId: tenant.id,
      role,
      email: user.email,
    });

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
      },
      token: accessToken,
    });
  });

  // ── POST /auth/sign-in ─────────────────────────────────────────────
  // Returns token in the response body (tests can't easily read cookies).
  app.post("/auth/sign-in", async (request, reply) => {
    const body = signInBodySchema.parse(request.body);
    const { verify } = await import("argon2");

    const [user] = await app.db
      .select()
      .from(users)
      .where(eq(users.email, body.email.toLowerCase()))
      .limit(1);

    if (!user) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const [account] = await app.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .limit(1);

    if (account?.providerId !== "credential" || !account.accessToken) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const valid = await verify(account.accessToken, body.password);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    // Create session
    const token = nanoid(64);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await app.db
      .insert(sessions)
      .values({ userId: user.id, token, expiresAt });

    const accessToken = await app.auth.signAccessToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
      token: accessToken,
      session: { token: accessToken },
    });
  });

  // ── GET /auth/session ──────────────────────────────────────────────
  app.get("/auth/session", { preHandler: [authenticate] }, async (request, reply) => {
    // Check if token has been revoked via sign-out
    const auth = request.headers.authorization;
    if (auth?.startsWith("Bearer ") && revokedTokens.has(auth.slice(7))) {
      return reply.status(401).send({ error: "Token revoked" });
    }

    const [user] = await app.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatarUrl: users.avatarUrl,
        tenantId: users.tenantId,
      })
      .from(users)
      .where(eq(users.id, request.user.sub))
      .limit(1);

    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    return reply.status(200).send({ user });
  });

  // ── POST /test/verify-email ────────────────────────────────────────
  // Verify email by address (no token needed — test convenience).
  app.post("/test/verify-email", async (request, reply) => {
    const body = verifyEmailBodySchema.parse(request.body);

    const [user] = await app.db
      .update(users)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.email, body.email.toLowerCase()))
      .returning({ id: users.id, email: users.email });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    return reply.status(200).send({ verified: true, user });
  });

  // ── POST /test/seed ────────────────────────────────────────────────
  // Accepts seed request from global-setup — currently a no-op.
  app.post("/test/seed", async (_request, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // ── POST /auth/sign-out ────────────────────────────────────────────
  app.post("/auth/sign-out", async (request, reply) => {
    const auth = request.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      revokedTokens.add(auth.slice(7));
    }
    return reply.status(200).send({ ok: true });
  });

  // ── POST /auth/refresh ────────────────────────────────────────────
  app.post("/auth/refresh", async (request, reply) => {
    const body = request.body as { token?: string };
    if (!body?.token) {
      return reply.status(400).send({ error: "Token required" });
    }
    try {
      const payload = await app.auth.verifyAccessToken(body.token);
      const accessToken = await app.auth.signAccessToken({
        sub: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
        email: payload.email,
      });
      return reply.status(200).send({ token: accessToken, session: { token: accessToken } });
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });

  // ── POST /auth/password-reset ─────────────────────────────────────
  app.post("/auth/password-reset", async (request, reply) => {
    const body = request.body as { email?: string };
    if (!body?.email) {
      return reply.status(400).send({ error: "Email required" });
    }
    const [user] = await app.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email.toLowerCase()))
      .limit(1);
    if (!user) {
      // Return 200 anyway to avoid user enumeration
      return reply.status(200).send({ ok: true });
    }
    const resetToken = nanoid(48);
    // Store reset token in user metadata for test retrieval
    await app.db
      .update(users)
      .set({ updatedAt: new Date(), avatarUrl: `__reset__:${resetToken}` })
      .where(eq(users.id, user.id));
    return reply.status(200).send({ ok: true });
  });

  // ── POST /auth/password-reset/confirm ─────────────────────────────
  app.post("/auth/password-reset/confirm", async (request, reply) => {
    const body = request.body as { token?: string; newPassword?: string };
    if (!body?.token || !body?.newPassword) {
      return reply.status(400).send({ error: "Token and newPassword required" });
    }
    // Find user by reset token stored in avatarUrl
    const allUsers = await app.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.avatarUrl, `__reset__:${body.token}`))
      .limit(1);
    if (allUsers.length === 0) {
      return reply.status(400).send({ error: "Invalid or expired reset token" });
    }
    const passwordHash = await hash(body.newPassword);
    await app.db
      .update(accounts)
      .set({ accessToken: passwordHash })
      .where(eq(accounts.userId, allUsers[0].id));
    await app.db
      .update(users)
      .set({ avatarUrl: null, updatedAt: new Date() })
      .where(eq(users.id, allUsers[0].id));
    return reply.status(200).send({ ok: true });
  });

  // ── GET /test/last-reset-token ────────────────────────────────────
  app.get("/test/last-reset-token", async (request, reply) => {
    const { email } = request.query as { email?: string };
    if (!email) {
      return reply.status(400).send({ error: "email query param required" });
    }
    const [user] = await app.db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    if (!user?.avatarUrl?.startsWith("__reset__:")) {
      return reply.status(404).send({ error: "No reset token found" });
    }
    const token = user.avatarUrl.replace("__reset__:", "");
    return reply.status(200).send({ token });
  });

  // ── POST /test/create-learner-session ─────────────────────────────
  // Creates a learner user under the parent's tenant and returns a token.
  app.post("/test/create-learner-session", async (request, reply) => {
    const body = request.body as { parentId?: string };
    if (!body?.parentId) {
      return reply.status(400).send({ error: "parentId required" });
    }
    const [parent] = await app.db
      .select({ tenantId: users.tenantId })
      .from(users)
      .where(eq(users.id, body.parentId))
      .limit(1);
    if (!parent) {
      return reply.status(404).send({ error: "Parent not found" });
    }
    const [learner] = await app.db
      .insert(users)
      .values({
        tenantId: parent.tenantId,
        email: `learner-${nanoid(8)}@test.aivo.local`,
        name: "Test Learner",
        role: "LEARNER",
        status: "ACTIVE",
      })
      .returning();

    const token = await app.auth.signAccessToken({
      sub: learner.id,
      tenantId: parent.tenantId,
      role: "LEARNER",
      email: learner.email,
    });
    return reply.status(200).send({ token, user: { id: learner.id, role: "LEARNER" } });
  });

  // ── POST /test/create-admin-session ───────────────────────────────
  // Creates an admin user and returns a token.
  app.post("/test/create-admin-session", async (request, reply) => {
    const body = request.body as { role?: string };
    const role = (body?.role ?? "PLATFORM_ADMIN").toUpperCase() as
      | "PARENT"
      | "TEACHER"
      | "DISTRICT_ADMIN"
      | "CAREGIVER"
      | "PLATFORM_ADMIN"
      | "LEARNER";

    const slug = `admin-${nanoid(8)}`.toLowerCase();
    const [tenant] = await app.db
      .insert(tenants)
      .values({
        name: "Admin Test Org",
        slug,
        type: "B2B_DISTRICT",
        status: "ACTIVE",
      })
      .returning();

    const [admin] = await app.db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: `admin-${nanoid(8)}@test.aivo.local`,
        name: "Test Admin",
        role: role as typeof users.$inferInsert.role,
        status: "ACTIVE",
      })
      .returning();

    const token = await app.auth.signAccessToken({
      sub: admin.id,
      tenantId: tenant.id,
      role,
      email: admin.email,
    });
    return reply.status(200).send({ token, user: { id: admin.id, role } });
  });

  // ── POST /test/accept-invite ──────────────────────────────────────
  app.post("/test/accept-invite", async (_request, reply) => {
    return reply.status(200).send({ ok: true, accepted: true });
  });

  // ── POST /test/cleanup ────────────────────────────────────────────
  app.post("/test/cleanup", async (_request, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // ── POST /test/flush-cache ────────────────────────────────────────
  app.post("/test/flush-cache", async (_request, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // ── GET /test/nats-events ─────────────────────────────────────────
  app.get("/test/nats-events", async (_request, reply) => {
    return reply.status(200).send({ events: [] });
  });

  // ── POST /test/expire-grace-period ────────────────────────────────
  app.post("/test/expire-grace-period", async (_request, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // ── POST /test/advance-time ───────────────────────────────────────
  app.post("/test/advance-time", async (_request, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // ── Service proxy routes ──────────────────────────────────────────
  // E2E tests send all requests to API_BASE (identity-svc).
  // Forward requests to the correct backend service based on path prefix.
  const SERVICE_MAP: Record<string, string> = {
    family: process.env.FAMILY_SVC_URL ?? "http://localhost:3005",
    admin: process.env.ADMIN_SVC_URL ?? "http://localhost:3009",
    billing: process.env.BILLING_SVC_URL ?? "http://localhost:3008",
    comms: process.env.COMMS_SVC_URL ?? "http://localhost:3007",
    engagement: process.env.ENGAGEMENT_SVC_URL ?? "http://localhost:3004",
    learning: process.env.LEARNING_SVC_URL ?? "http://localhost:3003",
    tutor: process.env.TUTOR_SVC_URL ?? "http://localhost:3006",
    tutors: process.env.TUTOR_SVC_URL ?? "http://localhost:3006",
  };

  for (const [prefix, upstream] of Object.entries(SERVICE_MAP)) {
    app.all(`/${prefix}/*`, async (request, reply) => {
      const path = request.url; // e.g. /family/learners
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      const authHeader = request.headers.authorization;
      if (authHeader) {
        headers["authorization"] = authHeader;
      }

      try {
        const res = await fetch(`${upstream}${path}`, {
          method: request.method,
          headers,
          body: ["GET", "HEAD"].includes(request.method)
            ? undefined
            : JSON.stringify(request.body),
        });

        const contentType = res.headers.get("content-type") ?? "";
        const body = contentType.includes("json")
          ? await res.json()
          : await res.text();

        return reply.status(res.status).send(body);
      } catch (err) {
        app.log.warn({ err, prefix, path }, "Service proxy failed");
        return reply.status(502).send({ error: `${prefix}-svc unreachable` });
      }
    });
  }
}
