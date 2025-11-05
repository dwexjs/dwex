import { Injectable, OnModuleInit } from "@dwex/core";
import { PrismaClient } from "@prisma/client";

/**
 * Database service using Prisma ORM
 *
 * This service extends PrismaClient and implements OnModuleInit
 * to connect to the database when the module initializes.
 */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
	async onModuleInit() {
		await this.$connect();
	}
}
