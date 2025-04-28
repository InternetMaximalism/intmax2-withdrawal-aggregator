import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";

export const eventSchema = table("events", {
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.varchar("name").notNull().unique(),
  lastBlockNumber: t.bigint("last_block_number", { mode: "bigint" }).notNull(),
  createdAt: t.timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  metadata: t.jsonb("metadata"),
});
