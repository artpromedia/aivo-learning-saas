import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { localeDirectionEnum, translationExportFormatEnum } from "./enums";

// ─── Locales ───────────────────────────────────────────────────────────────────
export const locales = pgTable(
  "locales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 10 }).notNull().unique(),
    name: varchar("name", { length: 128 }).notNull(),
    nativeName: varchar("native_name", { length: 128 }).notNull(),
    direction: localeDirectionEnum("direction").notNull().default("LTR"),
    isDefault: boolean("is_default").notNull().default(false),
    isEnabled: boolean("is_enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("locales_code_idx").on(t.code),
  ],
);

// ─── Translation Namespaces ────────────────────────────────────────────────────
export const translationNamespaces = pgTable(
  "translation_namespaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 128 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("translation_namespaces_key_idx").on(t.key),
  ],
);

// ─── Translations ──────────────────────────────────────────────────────────────
export const translations = pgTable(
  "translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    namespaceId: uuid("namespace_id")
      .notNull()
      .references(() => translationNamespaces.id, { onDelete: "cascade" }),
    localeCode: varchar("locale_code", { length: 10 })
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    key: varchar("key", { length: 512 }).notNull(),
    value: text("value").notNull(),
    isVerified: boolean("is_verified").notNull().default(false),
    verifiedBy: uuid("verified_by"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("translations_ns_locale_key_idx").on(t.namespaceId, t.localeCode, t.key),
    index("translations_locale_code_idx").on(t.localeCode),
    index("translations_namespace_id_idx").on(t.namespaceId),
  ],
);

// ─── Translation Exports ───────────────────────────────────────────────────────
export const translationExports = pgTable(
  "translation_exports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    localeCode: varchar("locale_code", { length: 10 })
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    format: translationExportFormatEnum("format").notNull(),
    exportedAt: timestamp("exported_at", { withTimezone: true }).notNull().defaultNow(),
    exportUrl: text("export_url"),
  },
);

// ─── Relations ─────────────────────────────────────────────────────────────────
export const localesRelations = relations(locales, ({ many }) => ({
  translations: many(translations),
  exports: many(translationExports),
}));

export const translationNamespacesRelations = relations(translationNamespaces, ({ many }) => ({
  translations: many(translations),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  namespace: one(translationNamespaces, {
    fields: [translations.namespaceId],
    references: [translationNamespaces.id],
  }),
  locale: one(locales, {
    fields: [translations.localeCode],
    references: [locales.code],
  }),
}));

export const translationExportsRelations = relations(translationExports, ({ one }) => ({
  locale: one(locales, {
    fields: [translationExports.localeCode],
    references: [locales.code],
  }),
}));
