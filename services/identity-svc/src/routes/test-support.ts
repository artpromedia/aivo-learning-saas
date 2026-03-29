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
    const [session] = await app.db
      .insert(sessions)
      .values({ userId: user.id, token, expiresAt })
      .returning();

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
}
