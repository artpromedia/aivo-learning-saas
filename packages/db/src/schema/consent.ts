import {
  pgTable,
  uuid,
  varchar,
  boolean,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./identity";

export const consentRecords = pgTable(
  "consent_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    consentType: varchar("consent_type", { length: 64 }).notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    granted: boolean("granted").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    index("consent_records_user_id_idx").on(t.userId),
    index("consent_records_consent_type_idx").on(t.consentType),
    index("consent_records_granted_at_idx").on(t.grantedAt),
  ],
);

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  user: one(users, { fields: [consentRecords.userId], references: [users.id] }),
}));
