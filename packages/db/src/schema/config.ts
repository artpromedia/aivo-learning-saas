import {
  pgTable,
  uuid,
  varchar,
  integer,
  date,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./identity";

// ─── Tenant Configs ─────────────────────────────────────────────────────────────
export const tenantConfigs = pgTable(
  "tenant_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    dailyLlmTokenQuota: integer("daily_llm_token_quota").notNull().default(0),
    features: jsonb("features").notNull().default({}),
    llmProviderOverride: varchar("llm_provider_override", { length: 128 }),
    llmModelOverride: varchar("llm_model_override", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("tenant_configs_tenant_id_idx").on(t.tenantId),
  ],
);

// ─── Tenant Usages ──────────────────────────────────────────────────────────────
export const tenantUsages = pgTable(
  "tenant_usages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    usageDate: date("usage_date").notNull(),
    tokensUsed: integer("tokens_used").notNull().default(0),
    requestsCount: integer("requests_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("tenant_usages_tenant_date_idx").on(t.tenantId, t.usageDate),
    index("tenant_usages_tenant_id_idx").on(t.tenantId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const tenantConfigsRelations = relations(tenantConfigs, ({ one }) => ({
  tenant: one(tenants, { fields: [tenantConfigs.tenantId], references: [tenants.id] }),
}));

export const tenantUsagesRelations = relations(tenantUsages, ({ one }) => ({
  tenant: one(tenants, { fields: [tenantUsages.tenantId], references: [tenants.id] }),
}));
