import { Injectable, OnModuleInit } from "@dwex/core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database service using Drizzle ORM
 *
 * This service initializes the database connection using the Postgres.js driver
 * and provides a Drizzle ORM instance for type-safe database queries.
 */
@Injectable()
export class DatabaseService implements OnModuleInit {
	private _db!: ReturnType<typeof drizzle<typeof schema>>;

	/**
	 * Get the Drizzle ORM instance
	 */
	get db() {
		return this._db;
	}

	async onModuleInit() {
		const connectionString =
			process.env.DATABASE_URL || "postgresql://localhost:5432/dwex";
		const client = postgres(connectionString);
		this._db = drizzle(client, { schema });
	}
}
