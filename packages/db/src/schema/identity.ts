import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenantTypeEnum, tenantStatusEnum, userRoleEnum, userStatusEnum } from "./enums";

// ─── Tenants ────────────────────────────────────────────────────────────────────
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    type: tenantTypeEnum("type").notNull(),
    status: tenantStatusEnum("status").notNull().default("ACTIVE"),
    planId: varchar("plan_id", { length: 128 }),
    settings: jsonb("settings").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("tenants_slug_idx").on(t.slug),
  ],
);

// ─── Users ──────────────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull(),
    avatarUrl: varchar("avatar_url", { length: 2048 }),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    index("users_tenant_id_idx").on(t.tenantId),
  ],
);

// ─── Sessions (Better Auth compatible) ──────────────────────────────────────────
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_token_idx").on(t.token),
    index("sessions_user_id_idx").on(t.userId),
  ],
);

// ─── Accounts (Better Auth OAuth compatible) ────────────────────────────────────
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: varchar("provider_id", { length: 128 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 512 }).notNull(),
    accessToken: varchar("access_token", { length: 4096 }),
    refreshToken: varchar("refresh_token", { length: 4096 }),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    scope: varchar("scope", { length: 1024 }),
    idToken: varchar("id_token", { length: 4096 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("accounts_provider_compound_idx").on(t.providerId, t.providerAccountId),
    index("accounts_user_id_idx").on(t.userId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
