import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  telegramId: integer("telegram_id").notNull().unique(),
  username: text("username").notNull().unique(),
  outrageGroup: text("outrage_group"),
  isActivated: boolean("is_activated").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
