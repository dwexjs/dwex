import { Injectable, OnModuleInit } from "@dwex/core";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

/**
 * Database service using Drizzle ORM
 *
 * This service initializes the database connection using Bun's SQLite driver
 * and provides a Drizzle ORM instance for type-safe database queries.
 */
@Injectable()
export class DatabaseService implements OnModuleInit {
	private _db!: BunSQLiteDatabase<typeof schema>;

	/**
	 * Get the Drizzle ORM instance
	 */
	get db(): BunSQLiteDatabase<typeof schema> {
		return this._db;
	}

	async onModuleInit() {
		const sqlite = new Database(process.env.DATABASE_URL || "local.db");
		this._db = drizzle(sqlite, { schema });
	}
}
