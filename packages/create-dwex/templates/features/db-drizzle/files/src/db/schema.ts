import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Example users table schema
 */
export const users = sqliteTable("users", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
