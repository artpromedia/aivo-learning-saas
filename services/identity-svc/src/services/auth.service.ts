import { eq } from "drizzle-orm";
import { hash, verify } from "argon2";
import { nanoid } from "nanoid";
import type { FastifyInstance } from "fastify";
import { users, sessions, accounts, tenants } from "@aivo/db";
import { publishEvent } from "@aivo/events";


export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface OAuthProfile {
  providerId: string;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
}

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async register(input: RegisterInput) {
    const existing = await this.app.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
    }

    const passwordHash = await hash(input.password);
    const userRole = input.role === "TEACHER" ? "TEACHER" : "PARENT";
    const slug = `${userRole === "TEACHER" ? "teacher" : "family"}-${nanoid(10)}`.toLowerCase();

    // Create tenant
    const [tenant] = await this.app.db
      .insert(tenants)
      .values({
        name: userRole === "TEACHER" ? `${input.name}'s Classroom` : `${input.name}'s Family`,
        slug,
        type: "B2C_FAMILY",
        status: "ACTIVE",
      })
      .returning();

    // Create user
    const [user] = await this.app.db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: input.email.toLowerCase(),
        name: input.name,
        role: userRole,
        status: "ACTIVE",
      })
      .returning();

    // Create credential account
    await this.app.db.insert(accounts).values({
      userId: user.id,
      providerId: "credential",
      providerAccountId: user.id,
      accessToken: passwordHash,
    });

    // Create session
    const session = await this.createSession(user.id);

    // Publish event
    // Publish event (non-blocking — streams may not be provisioned yet)
    await publishEvent(this.app.nats, "identity.user.created", {
      userId: user.id,
      tenantId: tenant.id,
      role: userRole,
      email: user.email,
    }).catch((err) => {
      this.app.log.warn({ err }, "Failed to publish user.created event");
    });

    return { user, tenant, session };
  }

  async login(input: LoginInput) {
    const [user] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    }

    if (user.status === "SUSPENDED") {
      throw Object.assign(new Error("Account suspended"), { statusCode: 403 });
    }

    const [account] = await this.app.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .limit(1);

    if (account?.providerId !== "credential" || !account.accessToken) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    }

    const valid = await verify(account.accessToken, input.password);
    if (!valid) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    }

    const session = await this.createSession(user.id);
    return { user, session };
  }

  async oauthLogin(profile: OAuthProfile) {
    // Check if account already linked
    const [existingAccount] = await this.app.db
      .select()
      .from(accounts)
      .where(eq(accounts.providerAccountId, profile.providerAccountId))
      .limit(1);

    if (existingAccount) {
      const [user] = await this.app.db
        .select()
        .from(users)
        .where(eq(users.id, existingAccount.userId))
        .limit(1);

      if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
      }

      const session = await this.createSession(user.id);
      return { user, session, isNew: false };
    }

    // Check if user with this email already exists
    const [existingUser] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.email, profile.email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      // Link OAuth account to existing user
      await this.app.db.insert(accounts).values({
        userId: existingUser.id,
        providerId: profile.providerId,
        providerAccountId: profile.providerAccountId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        idToken: profile.idToken,
      });

      const session = await this.createSession(existingUser.id);
      return { user: existingUser, session, isNew: false };
    }

    // New user — create tenant + user + account
    const slug = `family-${nanoid(10)}`.toLowerCase();
    const [tenant] = await this.app.db
      .insert(tenants)
      .values({
        name: `${profile.name}'s Family`,
        slug,
        type: "B2C_FAMILY",
        status: "ACTIVE",
      })
      .returning();

    const [user] = await this.app.db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: profile.email.toLowerCase(),
        name: profile.name,
        role: "PARENT",
        avatarUrl: profile.avatarUrl,
        status: "ACTIVE",
        emailVerifiedAt: new Date(), // OAuth emails are pre-verified
      })
      .returning();

    await this.app.db.insert(accounts).values({
      userId: user.id,
      providerId: profile.providerId,
      providerAccountId: profile.providerAccountId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      idToken: profile.idToken,
    });

    const session = await this.createSession(user.id);

    await publishEvent(this.app.nats, "identity.user.created", {
      userId: user.id,
      tenantId: tenant.id,
      role: "PARENT",
      email: user.email,
    }).catch((err) => {
      this.app.log.warn({ err }, "Failed to publish user.created event");
    });

    return { user, tenant, session, isNew: true };
  }

  async verifyEmail(userId: string) {
    const [user] = await this.app.db
      .update(users)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    return user;
  }

  async logout(sessionToken: string) {
    await this.app.db
      .delete(sessions)
      .where(eq(sessions.token, sessionToken));
  }

  async refreshSession(refreshToken: string) {
    const payload = await this.app.auth.verifyRefreshToken(refreshToken);

    const [session] = await this.app.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, payload.sessionId))
      .limit(1);

    if (!session || session.expiresAt < new Date()) {
      throw Object.assign(new Error("Session expired"), { statusCode: 401 });
    }

    const [user] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    // Generate new tokens
    const accessToken = await this.app.auth.signAccessToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    const newRefreshToken = await this.app.auth.signRefreshToken({
      sub: user.id,
      sessionId: session.id,
    });

    // Extend session
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.app.db
      .update(sessions)
      .set({
        expiresAt: newExpiry,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    return { accessToken, refreshToken: newRefreshToken, user };
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const [user] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      // Don't reveal whether email exists
      return "";
    }

    // Create short-lived token for password reset
    const resetToken = await this.app.auth.signAccessToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role ?? "PARENT",
      email: user.email,
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = await this.app.auth.verifyAccessToken(token);
    const passwordHash = await hash(newPassword);

    const [account] = await this.app.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, payload.sub))
      .limit(1);

    if (account?.providerId !== "credential") {
      throw Object.assign(new Error("Account not found"), { statusCode: 404 });
    }

    await this.app.db
      .update(accounts)
      .set({ accessToken: passwordHash, updatedAt: new Date() })
      .where(eq(accounts.id, account.id));

    // Invalidate all sessions
    await this.app.db
      .delete(sessions)
      .where(eq(sessions.userId, payload.sub));

    return { success: true };
  }

  async createSession(userId: string) {
    const token = nanoid(64);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [session] = await this.app.db
      .insert(sessions)
      .values({
        userId,
        token,
        expiresAt,
      })
      .returning();

    const [user] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    const accessToken = await this.app.auth.signAccessToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    const refreshToken = await this.app.auth.signRefreshToken({
      sub: user.id,
      sessionId: session.id,
    });

    return { session, accessToken, refreshToken };
  }
}
